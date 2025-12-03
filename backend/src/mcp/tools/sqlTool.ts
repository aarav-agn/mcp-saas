// backend/src/mcp/tools/sqlTool.ts
import prisma from "../../services/prisma";
import logger from "../../config/logger";

/**
 * SqlToolFactory returns an object with handler(params, ctx)
 * params: { query: string }
 */
export default function SqlToolFactory({ tenantId }: { tenantId: string; prisma?: any; logger?: any }) {
  return {
    description: "Execute read-only SQL (SELECT only)",
    async handler(params: { query: string }, ctx: any) {
      const { query } = params;
      if (!query || typeof query !== "string") return { error: "query required" };

      const q = query.trim();
      // Basic safety enforcement: allow only SELECT queries
      const lower = q.toLowerCase();
      if (!lower.startsWith("select")) {
        return { error: "Only SELECT queries are allowed in this environment" };
      }

      // Additional safety: disallow semicolons to prevent multi-statement injection
      if (q.includes(";")) {
        return { error: "Multiple statements or semicolons are not allowed" };
      }

      // IMPORTANT: $queryRawUnsafe is used here for demo only — replace with parameterized driver.
      try {
        const rows = await prisma.$queryRawUnsafe(q);
        return { rows };
      } catch (err: any) {
        logger.error({ err, tenantId }, "SQL execution error");
        return { error: "Query execution failed" };
      }
    }
  };
}
