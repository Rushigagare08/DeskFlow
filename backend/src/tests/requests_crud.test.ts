import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import db from "../db/database";
import { setupTestDatabase, generateTestToken, testUser1 } from "./setup";

describe("Request CRUD & Activity Tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  const tokenUser1 = generateTestToken(testUser1);

  // TEST 2 — Request list
  it("TEST 2 — GET /api/requests returns only workspace ws-1 requests", async () => {
    const res = await request(app)
      .get("/api/requests")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3); // req-1, req-2, req-3

    const workspaceIds = res.body.map((r: any) => r.workspaceId);
    expect(workspaceIds.every((id: string) => id === "ws-1")).toBe(true);
  });

  // TEST 4 — Request creation & workspace ID security
  it("TEST 4 — POST /api/requests assigns workspace_id from auth user, ignoring client override", async () => {
    const newRequestPayload = {
      customerName: "Sam Green",
      customerEmail: "sam@example.com",
      requestedService: "HVAC Installation",
      scheduledDate: "2026-11-15",
      status: "NEW",
      notes: "Commercial setup",
      workspaceId: "ws-2", // Malicious client attempt to override workspace ID
    };

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send(newRequestPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.workspaceId).toBe("ws-1"); // Guaranteed to belong to user1's workspace ws-1

    // Verify directly in DB
    const dbResult = await db.query("SELECT * FROM requests WHERE id = $1", [res.body.id]);
    const dbRow = dbResult.rows[0];
    expect(dbRow.workspace_id).toBe("ws-1");
  });

  // TEST 5 — Request validation
  it("TEST 5 — POST /api/requests returns 400 Bad Request on invalid data", async () => {
    const invalidPayload = {
      customerName: "", // empty customer name violates min length 1
      requestedService: "Plumbing",
      scheduledDate: "2026-12-01",
    };

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  // TEST 6 — Status filtering
  it("TEST 6 — GET /api/requests?status=... filters by status for current workspace", async () => {
    // 1. Filter NEW
    const resNew = await request(app)
      .get("/api/requests?status=NEW")
      .set("Authorization", `Bearer ${tokenUser1}`);
    expect(resNew.status).toBe(200);
    expect(resNew.body.every((r: any) => r.status === "NEW" && r.workspaceId === "ws-1")).toBe(true);
    expect(resNew.body.some((r: any) => r.id === "req-2")).toBe(true);

    // 2. Filter QUALIFIED
    const resQualified = await request(app)
      .get("/api/requests?status=QUALIFIED")
      .set("Authorization", `Bearer ${tokenUser1}`);
    expect(resQualified.status).toBe(200);
    expect(resQualified.body.every((r: any) => r.status === "QUALIFIED" && r.workspaceId === "ws-1")).toBe(true);
    expect(resQualified.body.some((r: any) => r.id === "req-1")).toBe(true);

    // 3. Filter CLOSED
    const resClosed = await request(app)
      .get("/api/requests?status=CLOSED")
      .set("Authorization", `Bearer ${tokenUser1}`);
    expect(resClosed.status).toBe(200);
    expect(resClosed.body.every((r: any) => r.status === "CLOSED" && r.workspaceId === "ws-1")).toBe(true);
    expect(resClosed.body.some((r: any) => r.id === "req-3")).toBe(true);
  });

  // TEST 12 — Request activity logging
  it("TEST 12 — Creating and updating request creates correct activity records", async () => {
    // 1. Create Request
    const createRes = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        customerName: "Activity Test Customer",
        customerEmail: "act@example.com",
        requestedService: "Roof Repair",
        scheduledDate: "2026-10-30",
        status: "NEW",
      });

    expect(createRes.status).toBe(201);
    const createdId = createRes.body.id;

    // Verify REQUEST_CREATED activity
    const actCreatedRes = await request(app)
      .get(`/api/requests/${createdId}/activities`)
      .set("Authorization", `Bearer ${tokenUser1}`);
    expect(actCreatedRes.status).toBe(200);
    expect(actCreatedRes.body.some((a: any) => a.action === "REQUEST_CREATED")).toBe(true);

    // 2. Update Request Status -> STATUS_CHANGED activity
    const statusUpdateRes = await request(app)
      .put(`/api/requests/${createdId}`)
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({ status: "QUALIFIED" });
    expect(statusUpdateRes.status).toBe(200);

    const actStatusRes = await request(app)
      .get(`/api/requests/${createdId}/activities`)
      .set("Authorization", `Bearer ${tokenUser1}`);
    expect(actStatusRes.body.some((a: any) => a.action === "STATUS_CHANGED")).toBe(true);

    // 3. Update Request Details -> REQUEST_UPDATED activity
    const detailsUpdateRes = await request(app)
      .put(`/api/requests/${createdId}`)
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({ notes: "Added inspection notes" });
    expect(detailsUpdateRes.status).toBe(200);

    const actDetailsRes = await request(app)
      .get(`/api/requests/${createdId}/activities`)
      .set("Authorization", `Bearer ${tokenUser1}`);
    expect(actDetailsRes.body.some((a: any) => a.action === "REQUEST_UPDATED")).toBe(true);
  });
});
