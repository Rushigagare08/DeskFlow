import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const poolConfig: PoolConfig = {
  connectionString,
};

// Enable SSL if specified in connection string or if connecting to remote host
if (
  process.env.PGSSLMODE === "require" ||
  (connectionString.includes("sslmode=require") && !connectionString.includes("localhost"))
) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

export default pool;