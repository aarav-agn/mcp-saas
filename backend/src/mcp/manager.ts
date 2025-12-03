// backend/src/mcp/manager.ts
import { createMcpForTenant } from "./factory";
import prisma from "../services/prisma";
import logger from "../config/logger";

/**
 * TenantManager manages MCP server instances per tenant.
 * Use TenantManager.getInstance(tenantId) to get or create a running server.
 */

class TenantManager {
  private instances: Map<string, { server: any; startedAt: number }>;

  constructor() {
    this.instances = new Map();
  }

  async getOrCreate(tenantId: string) {
    let entry = this.instances.get(tenantId);
    if (entry) return entry.server;

    // ensure tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }});
    if (!tenant) throw new Error("tenant not found");

    const server = await createMcpForTenant(tenantId);
    entry = { server, startedAt: Date.now() };
    this.instances.set(tenantId, entry);
    logger.info(`TenantManager created MCP server instance: ${JSON.stringify({ tenantId })}`);
    return server;
  }

  async stop(tenantId: string) {
    const entry = this.instances.get(tenantId);
    if (!entry) return;
    if (entry.server.stop) await entry.server.stop();
    this.instances.delete(tenantId);
    logger.info(`Tenant MCP server stopped and removed from cache: ${JSON.stringify({ tenantId })}`);
  }

  getRunningTenants() {
    return Array.from(this.instances.keys());
  }
}

export default new TenantManager();
