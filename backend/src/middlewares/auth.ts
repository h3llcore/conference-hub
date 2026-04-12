import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export type JwtPayload = {
  sub: string;
  role: "AUTHOR" | "REVIEWER" | "COMMITTEE";
  email: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "missing token" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const payload = decoded as JwtPayload;

    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "invalid token" });
  }
}