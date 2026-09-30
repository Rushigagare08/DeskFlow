import { Response } from "express";
import crypto from "crypto";
import pool from "../db/database";
import type { AuthRequest } from "../types";
import {
  createRequestSchema,
  updateRequestSchema,
  requestStatusEnum,
} from "../types/requestSchemas";
import { recordActivity, formatActivity } from "../services/activityService";

function formatRequest(row: any) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email || "",
    requestedService: row.requested_service,
    scheduledDate: row.scheduled_date,
    status: row.status,
    notes: row.notes || "",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function formatWorkItem(row: any) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    requestId: row.request_id,
    title: row.title,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

// 1. GET /api/requests
export async function getRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { workspaceId } = req.user;
  const statusFilter = req.query.status as string | undefined;

  let query = "SELECT * FROM requests WHERE workspace_id = $1";
  const queryParams: any[] = [workspaceId];

  if (statusFilter && statusFilter !== "ALL") {
    const statusValidation = requestStatusEnum.safeParse(statusFilter);
    if (!statusValidation.success) {
      res.status(400).json({ error: "Invalid status filter value" });
      return;
    }
    query += " AND status = $2";
    queryParams.push(statusValidation.data);
  }

  query += " ORDER BY created_at DESC";

  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows.map(formatRequest));
  } catch (error) {
    console.error("getRequests error:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
}

// 2. GET /api/requests/:id
export async function getRequestById(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = req.params.id as string;
  const { workspaceId } = req.user;

  try {
    const result = await pool.query(
      "SELECT * FROM requests WHERE id = $1 AND workspace_id = $2",
      [id, workspaceId]
    );

    const row = result.rows[0];
    if (!row) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    res.json(formatRequest(row));
  } catch (error) {
    console.error("getRequestById error:", error);
    res.status(500).json({ error: "Failed to fetch request" });
  }
}

// 3. POST /api/requests
export async function createRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const result = createRequestSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation error", details: result.error.issues });
    return;
  }

  const { customerName, customerEmail, requestedService, scheduledDate, status, notes } =
    result.data;

  const { workspaceId, id: userId } = req.user;
  const newId = `req-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  try {
    await pool.query(
      `INSERT INTO requests (
        id, workspace_id, customer_name, customer_email, requested_service, scheduled_date, status, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newId,
        workspaceId,
        customerName,
        customerEmail || "",
        requestedService,
        scheduledDate,
        status,
        notes || "",
        now,
        now,
      ]
    );

    // Automatic activity logging on request creation
    await recordActivity({
      workspaceId,
      requestId: newId,
      userId,
      action: "REQUEST_CREATED",
      details: "Request created",
    });

    const createdResult = await pool.query(
      "SELECT * FROM requests WHERE id = $1 AND workspace_id = $2",
      [newId, workspaceId]
    );

    res.status(201).json(formatRequest(createdResult.rows[0]));
  } catch (error) {
    console.error("createRequest error:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
}

// 4. PUT /api/requests/:id
export async function updateRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = req.params.id as string;
  const { workspaceId, id: userId } = req.user;

  try {
    const existingResult = await pool.query(
      "SELECT * FROM requests WHERE id = $1 AND workspace_id = $2",
      [id, workspaceId]
    );

    const existingRow = existingResult.rows[0];
    if (!existingRow) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    const result = updateRequestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Validation error", details: result.error.issues });
      return;
    }

    const data = result.data;
    const now = new Date().toISOString();

    const updatedName = data.customerName !== undefined ? data.customerName : existingRow.customer_name;
    const updatedEmail = data.customerEmail !== undefined ? data.customerEmail : existingRow.customer_email;
    const updatedService = data.requestedService !== undefined ? data.requestedService : existingRow.requested_service;
    const updatedDate = data.scheduledDate !== undefined ? data.scheduledDate : existingRow.scheduled_date;
    const updatedStatus = data.status !== undefined ? data.status : existingRow.status;
    const updatedNotes = data.notes !== undefined ? data.notes : existingRow.notes;

    await pool.query(
      `UPDATE requests
       SET customer_name = $1, customer_email = $2, requested_service = $3, scheduled_date = $4, status = $5, notes = $6, updated_at = $7
       WHERE id = $8 AND workspace_id = $9`,
      [
        updatedName,
        updatedEmail || "",
        updatedService,
        updatedDate,
        updatedStatus,
        updatedNotes || "",
        now,
        id,
        workspaceId,
      ]
    );

    // Automatic activity logging on request update
    const isStatusChanged = existingRow.status !== updatedStatus;
    const action = isStatusChanged ? "STATUS_CHANGED" : "REQUEST_UPDATED";
    const details = isStatusChanged
      ? `Status changed from ${existingRow.status} to ${updatedStatus}`
      : "Request updated";

    await recordActivity({
      workspaceId,
      requestId: id,
      userId,
      action,
      details,
    });

    const updatedResult = await pool.query(
      "SELECT * FROM requests WHERE id = $1 AND workspace_id = $2",
      [id, workspaceId]
    );

    res.json(formatRequest(updatedResult.rows[0]));
  } catch (error) {
    console.error("updateRequest error:", error);
    res.status(500).json({ error: "Failed to update request" });
  }
}

// 5. GET /api/requests/:id/activities
export async function getRequestActivities(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = req.params.id as string;
  const { workspaceId } = req.user;

  try {
    // Verify request belongs to the authenticated user's workspace
    const requestResult = await pool.query(
      "SELECT * FROM requests WHERE id = $1 AND workspace_id = $2",
      [id, workspaceId]
    );

    if (requestResult.rows.length === 0) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    // Fetch activities for request and workspace (ordered newest first)
    const result = await pool.query(
      `SELECT a.*, u.name as user_name
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.request_id = $1 AND a.workspace_id = $2
       ORDER BY a.created_at DESC`,
      [id, workspaceId]
    );

    res.json(result.rows.map(formatActivity));
  } catch (error) {
    console.error("getRequestActivities error:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
}

// 6. POST /api/requests/:id/work-item
export async function createWorkItemFromRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = req.params.id as string;
  const { workspaceId, id: userId } = req.user;

  try {
    // 1. Workspace isolation & Request lookup
    const requestResult = await pool.query(
      "SELECT * FROM requests WHERE id = $1 AND workspace_id = $2",
      [id, workspaceId]
    );

    const request = requestResult.rows[0];
    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    // 2. Status Rule: Only QUALIFIED status can be converted
    if (request.status !== "QUALIFIED") {
      res.status(400).json({
        error: `Cannot convert request to Work Item. Request status must be QUALIFIED (current status: ${request.status})`,
      });
      return;
    }

    // 3. Duplicate check before database insert
    const existingResult = await pool.query(
      "SELECT * FROM work_items WHERE request_id = $1 AND workspace_id = $2",
      [id, workspaceId]
    );

    if (existingResult.rows.length > 0) {
      res.status(409).json({ error: "Work item already exists for this request." });
      return;
    }

    const workItemId = `wi-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const title =
      req.body && typeof req.body.title === "string" && req.body.title.trim()
        ? req.body.title.trim()
        : `Work Item for ${request.requested_service} - ${request.customer_name}`;

    // 4. Atomicity: PostgreSQL Transaction for Work Item creation + Activity logging
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `INSERT INTO work_items (id, workspace_id, request_id, title, status, created_by, created_at)
         VALUES ($1, $2, $3, $4, 'PENDING', $5, $6)`,
        [workItemId, workspaceId, id, title, userId, now]
      );

      await recordActivity({
        workspaceId,
        requestId: id,
        userId,
        action: "WORK_ITEM_CREATED",
        details: "Converted request into Work Item",
        client,
      });

      await client.query("COMMIT");

      const createdResult = await pool.query(
        "SELECT * FROM work_items WHERE id = $1 AND workspace_id = $2",
        [workItemId, workspaceId]
      );

      res.status(201).json(formatWorkItem(createdResult.rows[0]));
    } catch (txErr: any) {
      await client.query("ROLLBACK");
      // PostgreSQL unique_violation code is 23505
      if (txErr.code === "23505" || (txErr.message && txErr.message.includes("unique constraint"))) {
        res.status(409).json({ error: "Work item already exists for this request." });
        return;
      }
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    if (err.code === "23505" || (err.message && err.message.includes("unique constraint"))) {
      res.status(409).json({ error: "Work item already exists for this request." });
      return;
    }
    console.error("createWorkItemFromRequest error:", err);
    res.status(500).json({ error: "Failed to convert request to Work Item." });
  }
}
