// backend/src/auth/local.controller.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../services/prisma";
import { signToken } from "./jwt";
import asyncHandler from "express-async-handler";

const router = Router();

/**
 * POST /api/auth/register
 * Creates a user (for demo / seed, use admin role creation from seed)
 */
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "user exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash, role: "member" }});
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role }});
  })
);

/**
 * POST /api/auth/login
 * Validates credentials, returns a JWT that NextAuth (frontend Credentials provider) will store inside session.
 */
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role }});
  })
);

/**
 * GET /api/auth/me
 * Validate Authorization header and return current user
 */
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "missing auth" });
    const token = auth.split(" ")[1];
    try {
      const decoded: any = (await import("jsonwebtoken")).verify(token, process.env.JWT_SECRET ?? "dev-secret");
      const user = await prisma.user.findUnique({ where: { id: decoded.sub }});
      if (!user) return res.status(404).json({ error: "user not found" });
      res.json({ user: { id: user.id, email: user.email, role: user.role }});
    } catch (err) {
      return res.status(401).json({ error: "invalid token" });
    }
  })
);

export default router;
