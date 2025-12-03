// backend/src/middleware/requireRole.ts
import { Request, Response, NextFunction } from "express";
/**
 * requireRole(['admin']) or requireRole(['admin', 'billing'])
 */
export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: "not authenticated" });
    const role = (req.auth as any).role;
    if (!roles.includes(role)) return res.status(403).json({ error: "insufficient role" });
    next();
  };
}
