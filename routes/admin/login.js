const express = require("express");

const router = express.Router();

const adminModel = require("../../models/admin");

router.post("/login", (req, res) => {
  try {
    // get username and password from request body
    const { username, password } = req.body;

    // check if username and password exists
    if (username == null || password == null) {
      // send a 400 response for data missing
      res.status(400).json({ err_msg: "username or password is empty" });
      return;
    }

    // checks if user and password match
    adminModel.loginAdmin(username, password, (err, result) => {
      // check if theres an error
      if (err) {
        // throw error
        throw err;

        // else check if theres a result
      } else if (!result) {
        // send a 401 for invalid credentials
        res.status(401).json({ err_msg: "Invalid Username or Password" });
      } else {
        // passed all checks send a 200 response and jwt token in the cookie
        res
          .cookie("token", result, { httpOnly: false })
          .status(200)
          .json({ token: result });
      }
    });
  } catch (err) {
    //  an error occured log it
    console.log("Error: ", err);

    // send a 500 response
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  // check if user has cookies
  if (!req.headers.cookie) {
    // no cookie exist send a 406 response
    res.status(406).send("Cookie Missing!");
  } else {
    // send a 200 response and clear the cookie
    res.status(200).clearCookie("token").send("Cookie Cleared");
  }
});

module.exports = router;
