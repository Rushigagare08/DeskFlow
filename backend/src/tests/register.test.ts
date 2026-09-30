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

  // ── Core happy path ──────────────────────────────────────────────────────

  it("3. Register with organization name → creates new workspace + user (201)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alice Example",
      email: "alice@example.com",
      password: "securepassword",
      workspaceName: "Alice Corp",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Account created successfully");
    expect(res.body.user).toMatchObject({
      email: "alice@example.com",
      name: "Alice Example",
      workspaceName: "Alice Corp",
      role: "admin",
    });
    // workspaceId must be a newly generated UUID (not ws-1 or ws-2)
    expect(typeof res.body.user.workspaceId).toBe("string");
    expect(res.body.user.workspaceId).not.toBe("ws-1");
    expect(res.body.user.workspaceId).not.toBe("ws-2");
    expect(res.body.user.workspaceId.length).toBeGreaterThan(8);
  });

  it("4. New workspace row is persisted in the database after registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bob Builder",
      email: "bob@example.com",
      password: "securepassword",
      workspaceName: "BuilderHub",
    });

    expect(res.status).toBe(201);
    const { workspaceId, workspaceName } = res.body.user;

    // Workspace must exist in the DB with the correct name
    const wsRow = await pool.query("SELECT * FROM workspaces WHERE id = $1", [workspaceId]);
    expect(wsRow.rows.length).toBe(1);
    expect(wsRow.rows[0].name).toBe("BuilderHub");
    expect(workspaceName).toBe("BuilderHub");
  });

  it("5. Two different registrations create two isolated workspaces", async () => {
    const res1 = await request(app).post("/api/auth/register").send({
      name: "User One",
      email: "user1@example.com",
      password: "securepassword",
      workspaceName: "Org One",
    });
    const res2 = await request(app).post("/api/auth/register").send({
      name: "User Two",
      email: "user2@example.com",
      password: "securepassword",
      workspaceName: "Org Two",
    });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    // Each gets a distinct workspace ID
    expect(res1.body.user.workspaceId).not.toBe(res2.body.user.workspaceId);
    // Demo workspaces are not affected
    expect(res1.body.user.workspaceId).not.toBe("ws-1");
    expect(res2.body.user.workspaceId).not.toBe("ws-1");
  });

  it("Same organization name is allowed for two separate registrations (each gets own workspace)", async () => {
    const res1 = await request(app).post("/api/auth/register").send({
      name: "Person A",
      email: "persona@example.com",
      password: "securepassword",
      workspaceName: "Shared Name Corp",
    });
    const res2 = await request(app).post("/api/auth/register").send({
      name: "Person B",
      email: "personb@example.com",
      password: "securepassword",
      workspaceName: "Shared Name Corp",
    });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    // Same org name but different workspace IDs — fully isolated
    expect(res1.body.user.workspaceId).not.toBe(res2.body.user.workspaceId);
  });

  // ── Rollback / atomicity ─────────────────────────────────────────────────

  it("Duplicate email rolls back — no workspace created (409)", async () => {
    // Count workspaces before
    const beforeCount = await pool.query("SELECT COUNT(*) FROM workspaces");
    const countBefore = parseInt(beforeCount.rows[0].count, 10);

    const res = await request(app).post("/api/auth/register").send({
      name: "Duplicate User",
      email: "aarav@brightpath.demo", // already exists in seed
      password: "securepassword",
      workspaceName: "Should Not Be Created",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "An account with this email already exists");

    // Workspace count must be unchanged — no orphan row created
    const afterCount = await pool.query("SELECT COUNT(*) FROM workspaces");
    expect(parseInt(afterCount.rows[0].count, 10)).toBe(countBefore);
  });

  // ── Security ─────────────────────────────────────────────────────────────

  it("Response does NOT contain password or hash", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Safe User",
      email: "safeuser@example.com",
      password: "securepassword",
      workspaceName: "Safe Corp",
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
      workspaceName: "Hash Corp",
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

  // ── Validation ───────────────────────────────────────────────────────────

  it("Duplicate email returns 409 Conflict", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Dupe User",
      email: "aarav@brightpath.demo",
      password: "securepassword",
      workspaceName: "Dupe Corp",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "An account with this email already exists");
  });

  it("Invalid email format returns 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bad Email",
      email: "not-an-email",
      password: "securepassword",
      workspaceName: "Some Corp",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation error");
  });

  it("Missing workspaceName returns 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "No Org",
      email: "noorg@example.com",
      password: "securepassword",
      // workspaceName intentionally omitted
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation error");
  });

  it("Empty workspaceName returns 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Empty Org",
      email: "emptyorg@example.com",
      password: "securepassword",
      workspaceName: "",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation error");
  });

  it("Short password returns 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Short Pass",
      email: "shortpass@example.com",
      password: "short",
      workspaceName: "Short Corp",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation error");
  });

  // ── End-to-end: register → login → /me ──────────────────────────────────

  it("Newly registered user can login and reach /api/auth/me with correct workspace", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      name: "Login After Register",
      email: "loginafter@example.com",
      password: "validpassword",
      workspaceName: "LoginTest Corp",
    });

    expect(regRes.status).toBe(201);
    const { workspaceId, workspaceName } = regRes.body.user;

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "loginafter@example.com",
      password: "validpassword",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    expect(loginRes.body.user.email).toBe("loginafter@example.com");
    expect(loginRes.body.user.workspaceId).toBe(workspaceId);
    expect(loginRes.body.user.workspaceName).toBe(workspaceName);

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe("loginafter@example.com");
    expect(meRes.body.user.workspaceId).toBe(workspaceId);
    expect(meRes.body.user.workspaceName).toBe(workspaceName);
  });
});
