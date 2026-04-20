import dotenv from "dotenv";

dotenv.config();

const requiredEnvs: string[] = ["JWT_SECRET", "DB_PASSWORD"];
const missingEnvs = requiredEnvs.filter((envName) => !process.env[envName]);

if (missingEnvs.length > 0) {
  console.error(
    `🚨 FATAL ERROR: Missing required environment variables: ${missingEnvs.join(", ")}`,
  );
  process.exit(1);
}

export const PORT = process.env.PORT || 8080;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_USER = process.env.DB_USER || "postgres";
export const DB_PORT = process.env.DB_PORT;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_NAME = process.env.DB_NAME || "pern_auth";
