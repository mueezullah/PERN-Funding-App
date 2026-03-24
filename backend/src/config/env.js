require("dotenv").config();

const requiredEnvs = ["JWT_SECRET", "DB_PASSWORD"];
const missingEnvs = requiredEnvs.filter((envName) => !process.env[envName]);

if (missingEnvs.length > 0) {
  console.error(`🚨 FATAL ERROR: Missing required environment variables: ${missingEnvs.join(", ")}`);
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PORT: process.env.DB_PORT || 5000,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME || "pern_auth",
};
