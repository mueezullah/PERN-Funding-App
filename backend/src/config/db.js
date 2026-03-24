const { Pool } = require("pg");
const { DB_HOST, DB_USER, DB_PORT, DB_PASSWORD, DB_NAME } = require("./env");

const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  port: DB_PORT,
  password: DB_PASSWORD,
  database: DB_NAME,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("Connection error", err));

module.exports = pool;
