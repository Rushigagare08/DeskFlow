import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import { setupTestDatabase, generateTestToken, testUser1 } from "./setup";
import { AppError } from "../middleware/errorHandler";

describe("Global Express Error Handling & Edge Cases", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  const tokenUser1 = generateTestToken(testUser1);

  // 1. GET /
  it("GET / returns 200 OK with status message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Client Request Desk API is running");
  });

  // 2. Unknown route handling (404)
  it("Returns 404 for unknown endpoints", async () => {
    const res = await request(app).get("/api/unknown/route");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Route not found/i);
  });

  // 3. Unauthorized access (401)
  it("GET /api/requests returns 401 without auth token", async () => {
    const res = await request(app).get("/api/requests");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  // 4. Malformed JSON handling (400)
  it("Handles malformed JSON payload cleanly with 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ malformed json ...");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid JSON format in request body.");
  });

  // 5. AppError Handling
  it("AppError handles custom HTTP status codes cleanly", () => {
    const customErr = new AppError(403, "Forbidden resource");
    expect(customErr.statusCode).toBe(403);
    expect(customErr.message).toBe("Forbidden resource");
  });
});
