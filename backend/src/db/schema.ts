import pool from "./database";

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      workspace_id VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_users_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS requests (
      id VARCHAR(255) PRIMARY KEY,
      workspace_id VARCHAR(255) NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      requested_service TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      status VARCHAR(20) NOT NULL CHECK(status IN ('NEW', 'QUALIFIED', 'CLOSED')) DEFAULT 'NEW',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_requests_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS work_items (
      id VARCHAR(255) PRIMARY KEY,
      workspace_id VARCHAR(255) NOT NULL,
      request_id VARCHAR(255) NOT NULL UNIQUE,
      title TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      created_by VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_work_items_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      CONSTRAINT fk_work_items_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      CONSTRAINT fk_work_items_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id VARCHAR(255) PRIMARY KEY,
      workspace_id VARCHAR(255) NOT NULL,
      request_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_activities_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      CONSTRAINT fk_activities_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_requests_workspace ON requests(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_activities_request_workspace ON activities(request_id, workspace_id);
  `);
}
