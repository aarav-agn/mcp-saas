// backend/src/mcp/factory.ts
import prisma from "../services/prisma";
import logger from "../config/logger";
import SqlToolFactory from "./tools/sqlTool";
import ApiToolFactory from "./tools/apiTool";

/**
 * This module tries to use a real MCP server library if available.
 * If not, it returns a LocalMcpServer adapter which implements:
 *   - async start()
 *   - async stop()
 *   - async call(toolName: string, params: any)
 *
 * The rest of the code expects server.call(toolName, params) to execute the tool.
 */

type ToolHandler = (params: any, context?: any) => Promise<any>;

class LocalMcpServer {
  tenantId: string;
  tools: Map<string, ToolHandler>;
  running: boolean;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.tools = new Map();
    this.running = false;
  }

  registerTool(name: string, handler: ToolHandler) {
    this.tools.set(name, handler);
  }

  async start() {
    this.running = true;
    logger.info(`LocalMcpServer started: ${JSON.stringify({ tenantId: this.tenantId })}`);
  }

  async stop() {
    this.running = false;
    logger.info(`LocalMcpServer stopped: ${JSON.stringify({ tenantId: this.tenantId })}`);
  }

  async call(toolName: string, params: any) {
    if (!this.running) throw new Error("MCP server not running");
    const handler = this.tools.get(toolName);
    if (!handler) throw new Error(`Tool not found: ${toolName}`);
    return handler(params, { tenantId: this.tenantId });
  }
}

export async function createMcpForTenant(tenantId: string) {
  // try to use a real MCP server lib if present
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MCP = require("@modelcontextprotocol/server");
    // if the import succeeds, use it
    const server = new MCP.Server({ name: `mcp-tenant-${tenantId}` });

    // register tools (adapters must match real library API)
    server.tool("run_sql", SqlToolFactory({ tenantId }));
    server.tool("call_api", ApiToolFactory({ tenantId }));

    // start server (library-specific)
    if (typeof server.start === "function") {
      await server.start();
    }

    logger.info(`MCP server created with @modelcontextprotocol/server: ${JSON.stringify({ tenantId })}`);
    return server;
  } catch (err) {
    // fallback to LocalMcpServer
    const server = new LocalMcpServer(tenantId);

    // register tools using our factories
    const sqlTool = SqlToolFactory({ tenantId, prisma, logger });
    const apiTool = ApiToolFactory({ tenantId, prisma, logger });

    // both factories return an object with handler(params) or a function
    // unify them:
    server.registerTool("run_sql", async (params: any, ctx: any) => {
      // expect { query }
      return await sqlTool.handler(params, ctx);
    });
    server.registerTool("call_api", async (params: any, ctx: any) => {
      return await apiTool.handler(params, ctx);
    });

    await server.start();
    return server;
  }
}
