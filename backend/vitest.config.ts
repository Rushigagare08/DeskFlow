import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

// Derive TEST database URL from DATABASE_URL
const mainDbUrl = process.env.DATABASE_URL || "postgresql://postgres:Rushi@69@localhost:5432/ClientRequestDesk";
const testDbUrl = process.env.TEST_DATABASE_URL || (mainDbUrl.includes("localhost") ? mainDbUrl.replace(/\/[^/?]+(\?.*)?$/, "/client_request_desk_test$1") : mainDbUrl);

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: testDbUrl,
      NODE_ENV: "test",
    },
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
