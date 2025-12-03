import { Router } from "express";

import authRouter from "./auth.routes";
import tenantRouter from "./tenant.routes";
import billingRouter from "./billing.routes";
import mcpRouter from "./mcp.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/tenants", tenantRouter);
router.use("/billing", billingRouter);
router.use("/mcp", mcpRouter);

export default router;
