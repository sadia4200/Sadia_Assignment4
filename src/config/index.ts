import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  database_url: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-rentnest-jwt-key-2026",
    expires_in: process.env.JWT_EXPIRES_IN || "7d",
  },
};

export default config;
