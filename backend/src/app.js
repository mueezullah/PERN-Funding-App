const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Global middlewares
app.use(express.json());
app.use(cors());

// Mount all routes
app.use(routes);

// Global error handler (must be after routes)
app.use(errorHandler);

module.exports = app;
