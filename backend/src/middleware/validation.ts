// backend/src/middleware/validation.ts
import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "validation_error", details: result.error.errors });
    req.body = result.data;
    next();
  };
}
