import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import pool from "../db/database";
import app from "../app";
import { setupTestDatabase } from "./setup";

describe("TEST — Registration (POST /api/auth/register)", () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it("3. Register with Workspace A (ws-1) → User belongs to Workspace A", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alice Workspace A",
      email: "alice@example.com",
      password: "securepassword",
      workspaceId: "ws-1",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Account created successfully");
    expect(res.body.user).toMatchObject({
      email: "alice@example.com",
      name: "Alice Workspace A",
      workspaceId: "ws-1",
      role: "member",
    });
  });

  it("4. Register with Workspace B (ws-2) → User belongs to Workspace B", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bob Workspace B",
      email: "bob@example.com",
      password: "securepassword",
      workspaceId: "ws-2",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: "bob@example.com",
      name: "Bob Workspace B",
      workspaceId: "ws-2",
      role: "member",
    });
  });

  it("5. Register with invalid workspace ID → FAIL (400)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Hacker User",
      email: "hacker@example.com",
      password: "securepassword",
      workspaceId: "non-existent-ws",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid workspace selection");
  });

  it("Response does NOT contain password or hash", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Safe User",
      email: "safeuser@example.com",
      password: "securepassword",
      workspaceId: "ws-1",
    });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty("password");
    expect(res.body.user).not.toHaveProperty("password");
    expect(JSON.stringify(res.body)).not.toContain("securepassword");
  });

  it("Password is stored as bcrypt hash (NOT plain text)", async () => {
    const plainPassword = "testpassword123";
    const res = await request(app).post("/api/auth/register").send({
      name: "Hash Test User",
      email: "hashcheck@example.com",
      password: plainPassword,
      workspaceId: "ws-1",
    });

    expect(res.status).toBe(201);

    const dbResult = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      ["hashcheck@example.com"]
    );
    const storedHash = dbResult.rows[0]?.password;
    expect(storedHash).toBeDefined();
    expect(storedHash).not.toBe(plainPassword);
    expect(storedHash.startsWith("$2")).toBe(true);
    expect(bcrypt.compareSync(plainPassword, storedHash)).toBe(true);
  });

  it("Duplicate email returns 409 Conflict", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Dupe User",
      email: "aarav@brightpath.demo",
      password: "securepassword",
      workspaceId: "ws-1",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "An account with this email already exists");
  });

  it("Invalid email format returns 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bad Email",
      email: "not-an-email",
      password: "securepassword",
      workspaceId: "ws-1",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation error");
  });

  it("Missing workspaceId returns 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "No Workspace",
      email: "nows@example.com",
      password: "securepassword",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation error");
  });

  it("Newly registered user can login and reach /api/auth/me", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login After Register",
      email: "loginafter@example.com",
      password: "validpassword",
      workspaceId: "ws-2",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "loginafter@example.com",
      password: "validpassword",
      workspaceId: "ws-2",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    expect(loginRes.body.user.email).toBe("loginafter@example.com");
    expect(loginRes.body.user.workspaceId).toBe("ws-2");

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe("loginafter@example.com");
    expect(meRes.body.user.workspaceId).toBe("ws-2");
  });
});
