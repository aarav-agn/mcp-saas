// backend/src/routes/mcp.routes.ts
import { Router } from "express";
import asyncHandler from "express-async-handler";
import TenantManager from "../mcp/manager";
import { requireAuth } from "../middleware/requireAuth";
import prisma from "../services/prisma";
import * as stripeSvc from "../billing/stripe.service";

const router = Router();

/**
 * POST /api/mcp/:tenantId/:toolName
 * Body: arbitrary JSON passed to tool
 *
 * This route:
 *  - ensures tenant MCP is running
 *  - invokes the tool via server.call(toolName, params)
 *  - after successful invocation, reports usage to Stripe (metered) if subscriptionItemId exists
 */
router.post("/:tenantId/:toolName", requireAuth, asyncHandler(async (req, res) => {
  const { tenantId, toolName } = req.params;
  const payload = req.body || {};

  // ensure MCP running
  const server = await TenantManager.getOrCreate(tenantId);

  // invoke tool - best effort: server.call(...) expected
  let result;
  try {
    if (typeof server.call === "function") {
      result = await server.call(toolName, payload);
    } else if (typeof server.invokeTool === "function") {
      result = await server.invokeTool(toolName, payload);
    } else if (typeof server.run === "function") {
      result = await server.run(toolName, payload);
    } else {
      throw new Error("MCP server invocation method unknown; update mcp.factory.ts to match library");
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Tool invocation failed", details: String(err) });
  }

  // record usage: increment meter by 1 per run (you can change logic)
  try {
    // find active subscription for tenant
    const sub = await prisma.subscription.findFirst({ where: { tenantId }});
    const subscriptionItemId = (sub as any)?.subscriptionItemId;
    if (subscriptionItemId) {
      await stripeSvc.recordUsage(subscriptionItemId, 1);
    } else {
      // no subscriptionItemId stored: log and continue
      console.warn("No subscriptionItemId for tenant, skipping usage record", { tenantId });
    }
  } catch (err: any) {
    // do not fail the tool invocation if usage reporting fails; just log
    console.error("Usage reporting failed", err);
  }

  res.json({ result });
}));

/**
 * POST /api/mcp/:tenantId/start  (admin)
 * POST /api/mcp/:tenantId/stop   (admin)
 */
router.post("/:tenantId/start", asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  await TenantManager.getOrCreate(tenantId);
  res.json({ ok: true });
}));

router.post("/:tenantId/stop", asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  await TenantManager.stop(tenantId);
  res.json({ ok: true });
}));

/**
 * GET /api/mcp/:tenantId/status
 */
router.get("/:tenantId/status", asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const running = TenantManager.getRunningTenants().includes(tenantId);
  res.json({ tenantId, running });
}));

export default router;
