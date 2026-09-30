import bcrypt from "bcryptjs";
import pool from "./database";
import { initDb } from "./schema";

let isDbInitialized = false;
let cachedPasswordHash: string | null = null;

export async function seedDb(): Promise<void> {
  if (!isDbInitialized) {
    await initDb();
    isDbInitialized = true;
  }

  if (!cachedPasswordHash) {
    cachedPasswordHash = bcrypt.hashSync("password123", 10);
  }

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

    const nowWs = new Date().toISOString();
    const req1Time = new Date(Date.now() - 3600000 * 24).toISOString();
    const req2Time = new Date(Date.now() - 3600000 * 12).toISOString();
    const req3Time = new Date(Date.now() - 3600000 * 48).toISOString();
    const req4Time = new Date(Date.now() - 3600000 * 18).toISOString();
    const req5Time = new Date(Date.now() - 3600000 * 6).toISOString();
    const req6Time = new Date(Date.now() - 3600000 * 36).toISOString();

    // 1. Insert Workspaces
    await client.query(
      `INSERT INTO workspaces (id, name, created_at) VALUES
       ('ws-1', 'BrightPath Solutions', $1),
       ('ws-2', 'NovaWorks Consulting', $1)`,
      [nowWs]
    );

    // 2. Insert Users
    await client.query(
      `INSERT INTO users (id, workspace_id, email, password, name, role, created_at) VALUES
       ('user-1', 'ws-1', 'aarav@brightpath.demo', $1, 'Aarav Mehta', 'member', $2),
       ('user-2', 'ws-2', 'ananya@novaworks.demo', $1, 'Ananya Sharma', 'member', $2)`,
      [cachedPasswordHash, nowWs]
    );

    // 3. Insert Requests
    await client.query(
      `INSERT INTO requests (id, workspace_id, customer_name, customer_email, requested_service, scheduled_date, status, notes, created_at, updated_at) VALUES
       ('req-1', 'ws-1', 'Priya Shah', 'priya.shah@techvista.demo', 'SEO Optimization', '2026-11-10', 'QUALIFIED', 'Full-site SEO audit and on-page optimization for TechVista corporate website. Includes keyword research, meta tag updates, and performance benchmarking.', $1, $1),
       ('req-2', 'ws-1', 'Rohan Kulkarni', 'rohan.kulkarni@greenleaf.demo', 'Website Development', '2026-12-01', 'NEW', 'Custom responsive website for GreenLeaf Organics — product catalog, online ordering, and blog integration using modern web stack.', $2, $2),
       ('req-3', 'ws-1', 'Aditya Joshi', 'aditya.joshi@urbanfit.demo', 'Mobile App Development', '2026-09-20', 'CLOSED', 'Cross-platform fitness tracking app for UrbanFit Gym. Delivered MVP with workout logging, meal plans, and push notifications. Project completed and handed off.', $3, $3),
       ('req-4', 'ws-2', 'Karan Desai', 'karan.desai@pinnacle.demo', 'Digital Marketing Strategy', '2026-11-15', 'QUALIFIED', 'Comprehensive digital marketing strategy for Pinnacle Realty — social media campaigns, Google Ads management, and lead generation funnel design.', $4, $4),
       ('req-5', 'ws-2', 'Neha Patil', 'neha.patil@bluewave.demo', 'Business Consultation', '2026-12-10', 'NEW', 'Strategic growth consultation for BlueWave Logistics — market expansion analysis, operational efficiency review, and competitive positioning report.', $5, $5),
       ('req-6', 'ws-2', 'Sneha Rao', 'sneha.rao@clearview.demo', 'Process Consulting', '2026-09-15', 'CLOSED', 'End-to-end process reengineering for ClearView Analytics — workflow automation, SOP documentation, and team training. Engagement completed successfully.', $6, $6)`,
      [req1Time, req2Time, req3Time, req4Time, req5Time, req6Time]
    );

    // 4. Insert Activities
    await client.query(
      `INSERT INTO activities (id, workspace_id, request_id, user_id, action, details, created_at) VALUES
       ('act-1', 'ws-1', 'req-1', 'user-1', 'REQUEST_CREATED', 'Request submitted by Priya Shah for SEO Optimization', $1),
       ('act-2', 'ws-1', 'req-1', 'user-1', 'STATUS_UPDATED', 'Status updated to QUALIFIED', $1),
       ('act-3', 'ws-1', 'req-2', 'user-1', 'REQUEST_CREATED', 'Request submitted by Rohan Kulkarni for Website Development', $2),
       ('act-4', 'ws-1', 'req-3', 'user-1', 'REQUEST_CREATED', 'Request submitted by Aditya Joshi for Mobile App Development', $3),
       ('act-5', 'ws-1', 'req-3', 'user-1', 'STATUS_UPDATED', 'Status updated to CLOSED', $3),
       ('act-6', 'ws-2', 'req-4', 'user-2', 'REQUEST_CREATED', 'Request submitted by Karan Desai for Digital Marketing Strategy', $4),
       ('act-7', 'ws-2', 'req-4', 'user-2', 'STATUS_UPDATED', 'Status updated to QUALIFIED', $4),
       ('act-8', 'ws-2', 'req-5', 'user-2', 'REQUEST_CREATED', 'Request submitted by Neha Patil for Business Consultation', $5),
       ('act-9', 'ws-2', 'req-6', 'user-2', 'REQUEST_CREATED', 'Request submitted by Sneha Rao for Process Consulting', $6),
       ('act-10', 'ws-2', 'req-6', 'user-2', 'STATUS_UPDATED', 'Status updated to CLOSED', $6)`,
      [req1Time, req2Time, req3Time, req4Time, req5Time, req6Time]
    );

    await client.query("COMMIT");
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
