const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const router = express.Router();

const productModel = require("../models/product");

const DOMAIN = "http://localhost:3000";

router.post("/", async (req, res) => {
  try {
    const { cartItems } = req.body;
    console.log(cartItems);
    if (!Array.isArray(cartItems)) {
      res.status(406).json({ err_msg: "Invalid Cart!" });
      return;
    }

    if (!cartItems || cartItems.length < 1) {
      res.status(406).json({ err_msg: "The cart is empty!" });
      return;
    }

    let errorFlag = false;
    for (let i = 0; i < cartItems.length; i += 1) {
      if (
        !cartItems[i].id ||
        !cartItems[i].name ||
        !cartItems[i].quantity ||
        !cartItems[i].price
      ) {
        errorFlag = true;
        res.status(401).json({ err_msg: "Invalid cart!" });
        break;
      }
    }
    if (errorFlag) {
      return;
    }

    const promises = cartItems.map((cartItem) =>
      productModel.getProductById(cartItem.id)
    );

    const dbCartItems = await Promise.all(promises);

    //  cursed validation of data
    for (let j = 0; j < dbCartItems.length; j += 1) {
      if (dbCartItems[j].length < 1) {
        errorFlag = true;
        res.status(401).json({
          err_msg:
            "Cart Items' ID cannot be verified, please clear the cart and try again!",
        });
        break;
      }
      if (dbCartItems[j][0].name !== cartItems[j].name) {
        errorFlag = true;
        res.status(401).json({
          err_msg:
            "Cart Items' Name cannot be verified, please clear the cart and try again!",
        });
        break;
      }
      if (cartItems[j].quantity > dbCartItems[j][0].stock_qty) {
        errorFlag = true;
        res.status(401).json({
          err_msg: `${cartItems[j].name} does not have enough stock! Enter a quantity lower than ${dbCartItems[j][0].stock_qty} for ${cartItems[j].name}`,
        });
        break;
      }
    }

    if (errorFlag) {
      return;
    }

    const lineItemData = [];
    for (let k = 0; k < cartItems.length; k += 1) {
      lineItemData.push({
        price_data: {
          currency: "sgd",
          product_data: {
            name: dbCartItems[k][0].name,
          },
          unit_amount: dbCartItems[k][0].price.replace(".", ""),
        },
        quantity: cartItems[k].quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItemData,
      mode: "payment",
      success_url: `${DOMAIN}/success.html`,
      cancel_url: `${DOMAIN}/cancel.html`,
    });
    res.status(303).json({ url: session.url });
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
