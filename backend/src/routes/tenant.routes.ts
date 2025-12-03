// backend/src/routes/tenant.routes.ts
import { Router } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../services/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

/**
 * GET /api/tenants/   - list (requires auth)
 */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const tenants = await prisma.tenant.findMany();
    res.json({ tenants });
  })
);

/**
 * POST /api/tenants/  - create new tenant (admin)
 */
router.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    const tenant = await prisma.tenant.create({ data: { name }});
    res.json({ tenant });
  })
);

export default router;
