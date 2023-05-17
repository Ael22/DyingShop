const express = require("express");
const createHttpError = require("http-errors");

const verifyToken = require("./auth/verifyToken");

const apiRouter = require("./routes/api");

// const verifyToken = require("./auth/verifyToken");

const app = express();
app.use(express.json()); // to process JSON in request body

app.use("/api", apiRouter);

app.use("/admin/dashboard", verifyToken);
app.use(express.static("public"));

app.post("/admin/verify", verifyToken);

// 404 handler
app.use(function (req, res, next) {
  return next(
    createHttpError(404, `Unknown Resource ${req.method} ${req.originalUrl}`)
  );
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  return res
    .status(err.status || 500)
    .json({ error: err.message || "Unknown Server Error!" });
});

module.exports = app;
