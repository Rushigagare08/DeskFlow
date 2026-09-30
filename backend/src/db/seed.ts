import bcrypt from "bcryptjs";
import pool from "./database";
import { initDb } from "./schema";

export async function seedDb(): Promise<void> {
  await initDb();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clean existing data in order of foreign key dependencies
    await client.query(`
      DELETE FROM activities;
      DELETE FROM work_items;
      DELETE FROM requests;
      DELETE FROM users;
      DELETE FROM workspaces;
    `);

    const passwordHash = bcrypt.hashSync("password123", 10);

    // Insert Workspaces
    const insertWorkspaceQuery = `
      INSERT INTO workspaces (id, name, created_at)
      VALUES ($1, $2, $3)
    `;
    const nowWs = new Date().toISOString();
    await client.query(insertWorkspaceQuery, ["ws-1", "BrightPath Solutions", nowWs]);
    await client.query(insertWorkspaceQuery, ["ws-2", "NovaWorks Consulting", nowWs]);

    // Insert Users
    const insertUserQuery = `
      INSERT INTO users (id, workspace_id, email, password, name, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await client.query(insertUserQuery, ["user-1", "ws-1", "aarav@brightpath.demo", passwordHash, "Aarav Mehta", "member", nowWs]);
    await client.query(insertUserQuery, ["user-2", "ws-2", "ananya@novaworks.demo", passwordHash, "Ananya Sharma", "member", nowWs]);

    // Insert Requests
    const insertRequestQuery = `
      INSERT INTO requests (id, workspace_id, customer_name, customer_email, requested_service, scheduled_date, status, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const req1Time = new Date(Date.now() - 3600000 * 24).toISOString();
    const req2Time = new Date(Date.now() - 3600000 * 12).toISOString();
    const req3Time = new Date(Date.now() - 3600000 * 48).toISOString();
    const req4Time = new Date(Date.now() - 3600000 * 18).toISOString();
    const req5Time = new Date(Date.now() - 3600000 * 6).toISOString();
    const req6Time = new Date(Date.now() - 3600000 * 36).toISOString();

    // ── BrightPath Solutions (ws-1) Requests ──

    await client.query(insertRequestQuery, [
      "req-1",
      "ws-1",
      "Priya Shah",
      "priya.shah@techvista.demo",
      "SEO Optimization",
      "2026-11-10",
      "QUALIFIED",
      "Full-site SEO audit and on-page optimization for TechVista corporate website. Includes keyword research, meta tag updates, and performance benchmarking.",
      req1Time,
      req1Time,
    ]);

    await client.query(insertRequestQuery, [
      "req-2",
      "ws-1",
      "Rohan Kulkarni",
      "rohan.kulkarni@greenleaf.demo",
      "Website Development",
      "2026-12-01",
      "NEW",
      "Custom responsive website for GreenLeaf Organics — product catalog, online ordering, and blog integration using modern web stack.",
      req2Time,
      req2Time,
    ]);

    await client.query(insertRequestQuery, [
      "req-3",
      "ws-1",
      "Aditya Joshi",
      "aditya.joshi@urbanfit.demo",
      "Mobile App Development",
      "2026-09-20",
      "CLOSED",
      "Cross-platform fitness tracking app for UrbanFit Gym. Delivered MVP with workout logging, meal plans, and push notifications. Project completed and handed off.",
      req3Time,
      req3Time,
    ]);

    // ── NovaWorks Consulting (ws-2) Requests ──

    await client.query(insertRequestQuery, [
      "req-4",
      "ws-2",
      "Karan Desai",
      "karan.desai@pinnacle.demo",
      "Digital Marketing Strategy",
      "2026-11-15",
      "QUALIFIED",
      "Comprehensive digital marketing strategy for Pinnacle Realty — social media campaigns, Google Ads management, and lead generation funnel design.",
      req4Time,
      req4Time,
    ]);

    await client.query(insertRequestQuery, [
      "req-5",
      "ws-2",
      "Neha Patil",
      "neha.patil@bluewave.demo",
      "Business Consultation",
      "2026-12-10",
      "NEW",
      "Strategic growth consultation for BlueWave Logistics — market expansion analysis, operational efficiency review, and competitive positioning report.",
      req5Time,
      req5Time,
    ]);

    await client.query(insertRequestQuery, [
      "req-6",
      "ws-2",
      "Sneha Rao",
      "sneha.rao@clearview.demo",
      "Process Consulting",
      "2026-09-15",
      "CLOSED",
      "End-to-end process reengineering for ClearView Analytics — workflow automation, SOP documentation, and team training. Engagement completed successfully.",
      req6Time,
      req6Time,
    ]);

    // Insert Sample Activities
    const insertActivityQuery = `
      INSERT INTO activities (id, workspace_id, request_id, user_id, action, details, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    // BrightPath activities
    await client.query(insertActivityQuery, ["act-1", "ws-1", "req-1", "user-1", "REQUEST_CREATED", "Request submitted by Priya Shah for SEO Optimization", req1Time]);
    await client.query(insertActivityQuery, ["act-2", "ws-1", "req-1", "user-1", "STATUS_UPDATED", "Status updated to QUALIFIED", req1Time]);
    await client.query(insertActivityQuery, ["act-3", "ws-1", "req-2", "user-1", "REQUEST_CREATED", "Request submitted by Rohan Kulkarni for Website Development", req2Time]);
    await client.query(insertActivityQuery, ["act-4", "ws-1", "req-3", "user-1", "REQUEST_CREATED", "Request submitted by Aditya Joshi for Mobile App Development", req3Time]);
    await client.query(insertActivityQuery, ["act-5", "ws-1", "req-3", "user-1", "STATUS_UPDATED", "Status updated to CLOSED", req3Time]);

    // NovaWorks activities
    await client.query(insertActivityQuery, ["act-6", "ws-2", "req-4", "user-2", "REQUEST_CREATED", "Request submitted by Karan Desai for Digital Marketing Strategy", req4Time]);
    await client.query(insertActivityQuery, ["act-7", "ws-2", "req-4", "user-2", "STATUS_UPDATED", "Status updated to QUALIFIED", req4Time]);
    await client.query(insertActivityQuery, ["act-8", "ws-2", "req-5", "user-2", "REQUEST_CREATED", "Request submitted by Neha Patil for Business Consultation", req5Time]);
    await client.query(insertActivityQuery, ["act-9", "ws-2", "req-6", "user-2", "REQUEST_CREATED", "Request submitted by Sneha Rao for Process Consulting", req6Time]);
    await client.query(insertActivityQuery, ["act-10", "ws-2", "req-6", "user-2", "STATUS_UPDATED", "Status updated to CLOSED", req6Time]);

    await client.query("COMMIT");
    console.log("Database seeded successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database seed failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDb().then(() => pool.end());
}
