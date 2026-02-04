const { Client } = require("pg");

const con = new Client({
  host: "localhost",
  user: "postgres",
  port: 5000,
  password: "12345678",
  database: "pern_auth",
});

con
  .connect()
  .then(() => console.log("✅Connected to PostgreSQL database"))
  .catch((err) => console.error("Connection error", err.stack));


const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5000,
  password: "12345678",
  database: "pern_auth",
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("Connection error", err));

module.exports = pool;
