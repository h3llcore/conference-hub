import type { Request, Response, NextFunction } from "express";

export function requireRole(roles: Array<"AUTHOR" | "REVIEWER" | "COMMITTEE">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = (req as any).user as { role?: string } | undefined;

    if (!payload?.role) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (!roles.includes(payload.role as any)) {
      return res.status(403).json({ message: "forbidden" });
    }

    next();
  };
}
