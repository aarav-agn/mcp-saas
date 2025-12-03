// backend/src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth/jwt";

export interface AuthRequest extends Request {
  auth?: { sub: string; email?: string; role?: string } | null;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "missing authorization header" });
  const token = auth.split(" ")[1];
  const { ok, decoded } = verifyToken(token);
  if (!ok) return res.status(401).json({ error: "invalid token" });
  req.auth = decoded as any;
  next();
}
