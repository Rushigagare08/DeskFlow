import { initDb } from "./schema";
import pool from "./database";

async function runMigration() {
  console.log("Running PostgreSQL schema migration...");
  try {
    await initDb();
    console.log("PostgreSQL schema migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

export { runMigration };
