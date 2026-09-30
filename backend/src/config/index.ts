import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "super-secret-key-change-in-prod-12345",
  jwtExpiresIn: "24h",
};
