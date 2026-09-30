import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

// Derive TEST database URL from DATABASE_URL
const mainDbUrl = process.env.DATABASE_URL || "postgresql://postgres:Rushi@69@localhost:5432/ClientRequestDesk";
const testDbUrl = process.env.TEST_DATABASE_URL || (mainDbUrl.includes("localhost") ? mainDbUrl.replace(/\/[^/?]+(\?.*)?$/, "/client_request_desk_test$1") : mainDbUrl);

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    env: {
      DATABASE_URL: testDbUrl,
      NODE_ENV: "test",
    },
    fileParallelism: false,
    maxWorkers: 1,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
