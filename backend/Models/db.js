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

con.query("SELECT * FROM datatable", (err, res) => {
  if (!err) {
    console.log(res.rows);
  } else {
    console.log(err.message);
  }
  con.end();
});
// module.exports = con;
