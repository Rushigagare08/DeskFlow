import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import { setupTestDatabase } from "./setup";

describe("TEST 1 — Authentication & Workspace Selection", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it("GET /api/workspaces returns safe public workspace list", async () => {
    const res = await request(app).get("/api/workspaces");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).not.toHaveProperty("password");
  });

  it("1. Login with correct user + correct workspace → SUCCESS", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "aarav@brightpath.demo",
        password: "password123",
        workspaceId: "ws-1",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");

    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toMatchObject({
      id: "user-1",
      email: "aarav@brightpath.demo",
      name: "Aarav Mehta",
      workspaceId: "ws-1",
      workspaceName: "BrightPath Solutions",
      role: "member",
    });
  });

  it("2. Login with correct user + wrong workspace → FAIL (401)", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "aarav@brightpath.demo",
        password: "password123",
        workspaceId: "ws-2", // Wrong workspace! Aarav belongs to ws-1
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });

  it("Login missing workspaceId → FAIL (400)", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "aarav@brightpath.demo",
        password: "password123",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Validation error");
  });
});
