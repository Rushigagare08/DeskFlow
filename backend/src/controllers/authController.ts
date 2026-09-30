import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { z } from "zod";
import pool from "../db/database";
import { config } from "../config";
import { AuthRequest } from "../types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Full name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  workspaceName: z.string().min(1, "Organization name is required").max(100, "Organization name is too long"),
});

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation error", details: result.error.issues });
    return;
  }

  const { email, password } = result.data;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const userResult = await pool.query(
      `SELECT u.*, w.name as workspace_name
       FROM users u
       JOIN workspaces w ON u.workspace_id = w.id
       WHERE LOWER(u.email) = $1`,
      [normalizedEmail]
    );

    const user = userResult.rows[0];

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        workspaceId: user.workspace_id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret as jwt.Secret,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.workspace_id,
        workspaceName: user.workspace_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.name, u.workspace_id, u.role, w.name as workspace_name
       FROM users u
       JOIN workspaces w ON u.workspace_id = w.id
       WHERE u.id = $1 AND u.workspace_id = $2`,
      [req.user.id, req.user.workspaceId]
    );

    const user = userResult.rows[0];

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.workspace_id,
        workspaceName: user.workspace_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation error", details: result.error.issues });
    return;
  }

  const { name, email, password, workspaceName } = result.data;
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedWorkspaceName = workspaceName.trim();

  // Check for duplicate email BEFORE opening a transaction
  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  // Atomically create workspace + user in one transaction
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create the new workspace
    const newWorkspaceId = randomUUID();
    const now = new Date().toISOString();
    await client.query(
      `INSERT INTO workspaces (id, name, created_at) VALUES ($1, $2, $3)`,
      [newWorkspaceId, trimmedWorkspaceName, now]
    );

    // 2. Hash password — never store plain text
    const passwordHash = await bcrypt.hash(password, 10);
    const newUserId = randomUUID();

    // 3. Create the user, assigned to the new workspace
    await client.query(
      `INSERT INTO users (id, workspace_id, email, password, name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [newUserId, newWorkspaceId, normalizedEmail, passwordHash, name.trim(), "admin", now]
    );

    await client.query("COMMIT");

    // Return safe user info — password/hash is NEVER included
    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: newUserId,
        email: normalizedEmail,
        name: name.trim(),
        workspaceId: newWorkspaceId,
        workspaceName: trimmedWorkspaceName,
        role: "admin",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}
