// backend/src/routes/auth.routes.ts
import { Router } from "express";
import localController from "../auth/local.controller";

const router = Router();
router.use("/", localController);
export default router;
