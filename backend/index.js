const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./Models/db");
const userModel = require("./Models/User");
const bodyParser = require("body-parser");
const cors = require("cors");
const signinRoute = require("./Routes/AuthRouter");
const signupRoute = require("./Routes/AuthRouter");
const AuthRouter = require("./Routes/AuthRouter");

app.use(express.json());

const PORT = process.env.PORT || 8080;

// Use routes
app.use("/signin", signinRoute);
app.use("/signup", signupRoute);

app.use(bodyParser.json());
app.use(cors());

// Initialize the users table
userModel
  .init()
  .then(() => {
    console.log("Database schema initialized");
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });

app.get("/ping", (req, res) => {
  res.send("PONG");
});

app.use("/auth", AuthRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
