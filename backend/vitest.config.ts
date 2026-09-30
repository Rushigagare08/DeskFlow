import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

// Derive TEST database URL from DATABASE_URL
const mainDbUrl = process.env.DATABASE_URL || "postgresql://postgres:Rushi@69@localhost:5432/ClientRequestDesk";
const testDbUrl = mainDbUrl.replace(/\/[^/?]+(\?.*)?$/, "/client_request_desk_test$1");

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: testDbUrl,
      NODE_ENV: "test",
    },
    fileParallelism: false,
  },
});
