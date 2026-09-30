import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import db from "../db/database";
import { setupTestDatabase, generateTestToken, testUser1 } from "./setup";

describe("Work Item Conversion Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  const tokenUser1 = generateTestToken(testUser1);

  // TEST 7 — Work-item conversion for QUALIFIED request
  it("TEST 7 — POST /api/requests/:id/work-item converts QUALIFIED request to work item", async () => {
    // req-1 is QUALIFIED and belongs to ws-1
    const res = await request(app)
      .post("/api/requests/req-1/work-item")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.requestId).toBe("req-1");
    expect(res.body.workspaceId).toBe("ws-1");
    expect(res.body.createdBy).toBe("user-1"); // Matches authenticated user ID
    expect(res.body.status).toBe("PENDING");
  });

  // TEST 8 — Non-qualified conversion rejection
  it("TEST 8 — Rejects conversion for NEW and CLOSED requests with HTTP 400", async () => {
    // 1. NEW request (req-2 in ws-1)
    const resNew = await request(app)
      .post("/api/requests/req-2/work-item")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(resNew.status).toBe(400);
    expect(resNew.body.error).toMatch(/QUALIFIED/i);

    // 2. CLOSED request (req-3 in ws-1)
    const resClosed = await request(app)
      .post("/api/requests/req-3/work-item")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(resClosed.status).toBe(400);
    expect(resClosed.body.error).toMatch(/QUALIFIED/i);
  });

  // TEST 9 — Duplicate conversion prevention
  it("TEST 9 — Converting the same request twice returns 409 Conflict and creates exactly 1 work item", async () => {
    // First attempt: succeeds (201)
    const res1 = await request(app)
      .post("/api/requests/req-1/work-item")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res1.status).toBe(201);

    // Second attempt: fails with 409 Conflict
    const res2 = await request(app)
      .post("/api/requests/req-1/work-item")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res2.status).toBe(409);
    expect(res2.body.error).toMatch(/already exists/i);

    // Verify database count is exactly 1
    const countResult = await db.query("SELECT COUNT(*) as count FROM work_items WHERE request_id = $1", ["req-1"]);
    expect(Number(countResult.rows[0].count)).toBe(1);
  });

  // TEST 10 — Conversion activity creation
  it("TEST 10 — Conversion creates WORK_ITEM_CREATED activity with correct user and request ID", async () => {
    const res = await request(app)
      .post("/api/requests/req-1/work-item")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(201);

    // Fetch activities for req-1
    const actRes = await request(app)
      .get("/api/requests/req-1/activities")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(actRes.status).toBe(200);

    const conversionActivity = actRes.body.find(
      (a: any) => a.action === "WORK_ITEM_CREATED"
    );

    expect(conversionActivity).toBeDefined();
    expect(conversionActivity.requestId).toBe("req-1");
    expect(conversionActivity.userId).toBe("user-1");
    expect(conversionActivity.workspaceId).toBe("ws-1");
  });
});
