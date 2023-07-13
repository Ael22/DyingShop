const express = require("express");

const customerModel = require("../../models/customer");
const verifyToken = require("../../auth/verifyToken");

const router = express.Router();

router.use("/customer", verifyToken);

router.get("/customer", (req, res) => {
  try {
    customerModel
      .getAllCustomers()
      .then((result) => {
        if (result) {
          res.status(200).json({ customers: result });
        }
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
