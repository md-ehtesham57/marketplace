import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized — no token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  void (async () => {
    try {
      if (!process.env.JWT_SECRET) {
        res.status(500).json({ error: "Authentication is not configured" });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ error: "Unauthorized — invalid token" });
        return;
      }

      req.userId = user.id;
      req.userRole = user.role;
      next();
    } catch {
      res.status(401).json({ error: "Unauthorized — invalid token" });
    }
  })();
};

export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== "ADMIN") {
    res.status(403).json({ error: "Forbidden — admin access required" });
    return;
  }
  next();
};
