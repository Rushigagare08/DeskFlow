import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { AuthRequest, UserPayload } from "../types";

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required. Missing token." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token || "", config.jwtSecret) as unknown as UserPayload;
    
    // Attach decoded user payload (including workspaceId) to request
    req.user = {
      id: decoded.id,
      workspaceId: decoded.workspaceId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}
