const express = require("express");
const createHttpError = require("http-errors");

const adminModel = require("./models/admin");

const verifyToken = require("./auth/verifyToken").default;

const app = express();
app.use(express.json()); // to process JSON in request body

app.use("/admin/dashboard", verifyToken);

app.use(express.static("public"));

app.get("/test", (req, res) => res.json({ hello: "world" }));

// Method only for admin to use
// need auth

// app.post("/admin/create", (req, res) => {
//   const { username, password } = req.body;
//   if (username == null || password == null) {
//     res.status(400).json({ err_msg: "username or password is empty" });
//   } else {
//     adminModel.createAdmin(username, password, (err, result) => {
//       if (err) {
//         if (err.code === "ER_DUP_ENTRY") {
//           res.status(400).json({ err_msg: "Username is taken. Try another" });
//         } else {
//           res.status(500).json({ err_msg: "Internal server error" });
//         }
//       } else {
//         res.status(200).json({ success_msg: "Admin Created!" });
//       }
//     });
//   }
// });

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username == null || password == null) {
    res.status(400).json({ err_msg: "username or password is empty" });
  }
  adminModel.loginAdmin(username, password, (err, result) => {
    if (err) {
      res.status(500).json({ err_msg: "Internal server error" });
    } else if (!result) {
      res.status(401).json({ err_msg: "Invalid Username or Password" });
    } else {
      res
        .cookie("token", result, { httpOnly: false })
        .status(200)
        .json({ token: result });
    }
  });
});

app.post("/api/admin/logout", (req, res) => {
  if (!req.headers.cookie) {
    res.status(406).send("Cookie Missing!");
  } else {
    res.status(200).clearCookie("token").send("Cookie Cleared");
  }
});

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
