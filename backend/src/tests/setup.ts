import jwt from "jsonwebtoken";
import pool from "../db/database";
import { seedDb } from "../db/seed";
import { config } from "../config";

export async function setupTestDatabase(): Promise<void> {
  await seedDb();
}

export function generateTestToken(user: { id: string; workspaceId: string; email: string; name: string; role: string }) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: "1h" });
}

export const testUser1 = {
  id: "user-1",
  workspaceId: "ws-1",
  email: "aarav@brightpath.demo",
  name: "Aarav Mehta",
  role: "member",
};

export const testUser2 = {
  id: "user-2",
  workspaceId: "ws-2",
  email: "ananya@novaworks.demo",
  name: "Ananya Sharma",
  role: "member",
};
