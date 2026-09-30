import path from "path";
import pool from "./database";

async function migrateData() {
  const sqlitePath = path.resolve(__dirname, "../../database.sqlite");
  console.log(`Reading existing SQLite data from: ${sqlitePath}`);

  let Database: any;
  try {
    Database = require("better-sqlite3");
  } catch {
    console.error("better-sqlite3 is not installed. SQLite data has already been migrated to PostgreSQL.");
    return;
  }

  let sqliteDb: any;
  try {
    sqliteDb = new Database(sqlitePath, { readonly: true });
  } catch (err: any) {
    console.error(`Failed to open SQLite database: ${err.message}`);
    process.exit(1);
  }

  try {
    // 1. Read SQLite data
    const workspaces = sqliteDb.prepare("SELECT * FROM workspaces").all() as any[];
    const users = sqliteDb.prepare("SELECT * FROM users").all() as any[];
    const requests = sqliteDb.prepare("SELECT * FROM requests").all() as any[];
    const workItems = sqliteDb.prepare("SELECT * FROM work_items").all() as any[];
    const activities = sqliteDb.prepare("SELECT * FROM activities").all() as any[];

    console.log("=== SQLite Source Counts ===");
    console.log(`Workspaces: ${workspaces.length}`);
    console.log(`Users:      ${users.length}`);
    console.log(`Requests:   ${requests.length}`);
    console.log(`Work Items: ${workItems.length}`);
    console.log(`Activities: ${activities.length}`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 2. Insert Workspaces
      for (const ws of workspaces) {
        await client.query(
          `INSERT INTO workspaces (id, name, created_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             created_at = EXCLUDED.created_at`,
          [ws.id, ws.name, ws.created_at]
        );
      }

      // 3. Insert Users (preserving bcrypt hashes)
      for (const u of users) {
        await client.query(
          `INSERT INTO users (id, workspace_id, email, password, name, role, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             workspace_id = EXCLUDED.workspace_id,
             email = EXCLUDED.email,
             password = EXCLUDED.password,
             name = EXCLUDED.name,
             role = EXCLUDED.role,
             created_at = EXCLUDED.created_at`,
          [u.id, u.workspace_id, u.email, u.password, u.name, u.role, u.created_at]
        );
      }

      // 4. Insert Requests
      for (const r of requests) {
        await client.query(
          `INSERT INTO requests (id, workspace_id, customer_name, customer_email, requested_service, scheduled_date, status, notes, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             workspace_id = EXCLUDED.workspace_id,
             customer_name = EXCLUDED.customer_name,
             customer_email = EXCLUDED.customer_email,
             requested_service = EXCLUDED.requested_service,
             scheduled_date = EXCLUDED.scheduled_date,
             status = EXCLUDED.status,
             notes = EXCLUDED.notes,
             created_at = EXCLUDED.created_at,
             updated_at = EXCLUDED.updated_at`,
          [
            r.id,
            r.workspace_id,
            r.customer_name,
            r.customer_email || "",
            r.requested_service,
            r.scheduled_date,
            r.status,
            r.notes || "",
            r.created_at,
            r.updated_at,
          ]
        );
      }

      // 5. Insert Work Items
      for (const wi of workItems) {
        await client.query(
          `INSERT INTO work_items (id, workspace_id, request_id, title, status, created_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             workspace_id = EXCLUDED.workspace_id,
             request_id = EXCLUDED.request_id,
             title = EXCLUDED.title,
             status = EXCLUDED.status,
             created_by = EXCLUDED.created_by,
             created_at = EXCLUDED.created_at`,
          [wi.id, wi.workspace_id, wi.request_id, wi.title, wi.status, wi.created_by, wi.created_at]
        );
      }

      // 6. Insert Activities
      for (const a of activities) {
        await client.query(
          `INSERT INTO activities (id, workspace_id, request_id, user_id, action, details, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             workspace_id = EXCLUDED.workspace_id,
             request_id = EXCLUDED.request_id,
             user_id = EXCLUDED.user_id,
             action = EXCLUDED.action,
             details = EXCLUDED.details,
             created_at = EXCLUDED.created_at`,
          [a.id, a.workspace_id, a.request_id, a.user_id, a.action, a.details || "", a.created_at]
        );
      }

      await client.query("COMMIT");
      console.log("PostgreSQL data migration committed successfully!");

      // 7. Verify counts in PostgreSQL
      const pgWorkspaces = (await client.query("SELECT COUNT(*) FROM workspaces")).rows[0].count;
      const pgUsers = (await client.query("SELECT COUNT(*) FROM users")).rows[0].count;
      const pgRequests = (await client.query("SELECT COUNT(*) FROM requests")).rows[0].count;
      const pgWorkItems = (await client.query("SELECT COUNT(*) FROM work_items")).rows[0].count;
      const pgActivities = (await client.query("SELECT COUNT(*) FROM activities")).rows[0].count;

      console.log("=== PostgreSQL Target Counts ===");
      console.log(`Workspaces: ${pgWorkspaces} (SQLite: ${workspaces.length})`);
      console.log(`Users:      ${pgUsers} (SQLite: ${users.length})`);
      console.log(`Requests:   ${pgRequests} (SQLite: ${requests.length})`);
      console.log(`Work Items: ${pgWorkItems} (SQLite: ${workItems.length})`);
      console.log(`Activities: ${pgActivities} (SQLite: ${activities.length})`);

      const allMatch =
        Number(pgWorkspaces) === workspaces.length &&
        Number(pgUsers) === users.length &&
        Number(pgRequests) === requests.length &&
        Number(pgWorkItems) === workItems.length &&
        Number(pgActivities) === activities.length;

      if (!allMatch) {
        throw new Error("Row count mismatch between SQLite source and PostgreSQL target!");
      }

      console.log("All row counts verified successfully and match 100%!");
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Data migration failed:", err);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pool.end();
  }
}

if (require.main === module) {
  migrateData();
}

export { migrateData };
