import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import db from "../db/database";
import { setupTestDatabase, generateTestToken, testUser1 } from "./setup";

describe("Workspace Isolation Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  const tokenUser1 = generateTestToken(testUser1);

  // TEST 3 — Workspace isolation on read and update
  it("TEST 3 — GET /api/requests/:id and PUT /api/requests/:id reject cross-workspace access with 404", async () => {
    // req-4 belongs to workspace ws-2. user1 belongs to workspace ws-1.

    // 1. GET attempt on ws-2 request by ws-1 user
    const getRes = await request(app)
      .get("/api/requests/req-4")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(getRes.status).toBe(404);
    expect(getRes.body).toHaveProperty("error");

    // 2. PUT attempt on ws-2 request by ws-1 user
    const putRes = await request(app)
      .put("/api/requests/req-4")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({ customerName: "Hacked Customer Name" });

    expect(putRes.status).toBe(404);

    // Verify DB record for req-4 in ws-2 is unchanged
    const dbResult = await db.query("SELECT * FROM requests WHERE id = $1", ["req-4"]);
    const dbRow = dbResult.rows[0];
    expect(dbRow.customer_name).toBe("Karan Desai"); // Unchanged original value
  });

  // TEST 11 — Cross-workspace work item conversion
  it("TEST 11 — POST /api/requests/:id/work-item rejects cross-workspace request conversion with 404", async () => {
    // req-4 is a QUALIFIED request belonging to ws-2.
    // user1 belongs to ws-1.

    const res = await request(app)
      .post("/api/requests/req-4/work-item")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(404);

    // Verify no work item was created for req-4
    const workItemResult = await db.query("SELECT * FROM work_items WHERE request_id = $1", ["req-4"]);
    expect(workItemResult.rows.length).toBe(0);
  });
});
