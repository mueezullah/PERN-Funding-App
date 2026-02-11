const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./Models/db");
const userModel = require("./Models/User");
const bodyParser = require("body-parser");
const cors = require("cors");
const loginRoute = require("./Routes/AuthRouter");
const signupRoute = require("./Routes/AuthRouter");
const AuthRouter = require("./Routes/AuthRouter");
const adminRoute = require("./Routes/adminRoute");
const productRouter = require("./Routes/ProductRouter");

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

// Use routes
app.use("/auth", signupRoute);
app.use("/auth", loginRoute);
app.use("/admin", adminRoute);

app.use("/products", productRouter);

// Initialize the users table
userModel
  .init()
  .then(() => {
    console.log("Database schema initialized");
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });

app.use("/auth", AuthRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
