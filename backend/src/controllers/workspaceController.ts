import { Request, Response } from "express";
import pool from "../db/database";

export async function getWorkspaces(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      "SELECT id, name FROM workspaces ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("getWorkspaces error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
