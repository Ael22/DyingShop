const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const router = express.Router();

const DOMAIN = "http://localhost:3000";

router.post("/", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "sgd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2200,
          tax_behavior: "exclusive",
        },
        quantity: 5,
      },
    ],
    mode: "payment",
    success_url: `${DOMAIN}/success.html`,
    cancel_url: `${DOMAIN}/cancel.html`,
  });
  res.redirect(303, session.url);
});

module.exports = router;
