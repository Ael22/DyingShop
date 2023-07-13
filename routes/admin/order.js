const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const orderModel = require("../../models/order");
const verifyToken = require("../../auth/verifyToken");

const router = express.Router();

router.use("/order", verifyToken);

router.get("/order", (req, res) => {
  try {
    orderModel
      .getAllOrders()
      .then((result) => {
        res.status(200).json({ orders: result });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.post("/order/refund", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    const updateResult = await orderModel.updateRefundStatus(paymentIntentId);

    if (!updateResult) {
      res.status(400).json({ err_msg: `Refund failed` });
      return;
    }

    res.status(200).json({ success: `Order refunded` });
  } catch (err) {
    console.error(err);

    if (err.type === "StripeInvalidRequestError") {
      res.status(500).json({ err_msg: err.raw.message });
      return;
    }
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
