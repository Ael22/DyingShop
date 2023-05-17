const express = require("express");

const router = express.Router();

const adminModel = require("../../models/admin");

router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (username == null || password == null) {
      res.status(400).json({ err_msg: "username or password is empty" });
      return;
    }
    adminModel.loginAdmin(username, password, (err, result) => {
      if (err) {
        console.log("Error: ", err);
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
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  if (!req.headers.cookie) {
    res.status(406).send("Cookie Missing!");
  } else {
    res.status(200).clearCookie("token").send("Cookie Cleared");
  }
});

module.exports = router;
