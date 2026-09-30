import crypto from "crypto";
import { PoolClient } from "pg";
import pool from "../db/database";

export interface RecordActivityInput {
  workspaceId: string;
  requestId: string;
  userId: string;
  action: string;
  details?: string;
  client?: PoolClient;
}

export async function recordActivity({
  workspaceId,
  requestId,
  userId,
  action,
  details,
  client,
}: RecordActivityInput): Promise<void> {
  const id = `act-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO activities (id, workspace_id, request_id, user_id, action, details, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const queryParams = [id, workspaceId, requestId, userId, action, details || "", now];

  if (client) {
    await client.query(queryText, queryParams);
  } else {
    await pool.query(queryText, queryParams);
  }
}

export function formatActivity(row: any) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    requestId: row.request_id,
    userId: row.user_id,
    action: row.action,
    details: row.details || "",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    userName: row.user_name || undefined,
  };
}
