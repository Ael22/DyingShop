const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const jwt = require("jsonwebtoken");

const router = express.Router();

const productModel = require("../models/product");
const stripeSessionModel = require("../models/stripeSession");

// domain of site
const { DOMAIN } = process.env;

// checkout post endpoint for when user wants to checkout
router.post("/", async (req, res) => {
  try {
    // Retrieve cart items from reqeust body
    const { cartItems } = req.body;
    let customerId = null;
    let token = null;

    if (req.headers.cookie) {
      token = req.headers.cookie.replace("token=", "");
    }

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
          // log the error and redirect user
          console.log(err);
          res.status(403).json({ err_msg: "User failed verified" });
          return;
        }
        if (!decoded.adminAuth) {
          customerId = decoded.id;
        }
      });
    }

    // Checks if cart exists
    if (!cartItems) {
      // Sends a 406 response for no cart found
      res.status(406).json({ err_msg: "No cart found!" });
      return;
    }

    // Checks if cart is an array
    if (!Array.isArray(cartItems)) {
      // Sends a 406 response for invalid cart
      res.status(406).json({ err_msg: "Invalid Cart!" });
      return;
    }

    // checks if cart has items
    if (cartItems.length < 1) {
      // Sends a 406 response for empty cart
      res.status(406).json({ err_msg: "The cart is empty!" });
      return;
    }

    // cart passes check move on to validating cart

    // Declare errorFlag for validating cart
    let errorFlag = false;

    // Loop through all cart items
    for (let i = 0; i < cartItems.length; i += 1) {
      // Checks if cart items are missing any properties
      if (
        !cartItems[i].id ||
        !cartItems[i].name ||
        !cartItems[i].quantity ||
        !cartItems[i].price
      ) {
        // Flag error
        errorFlag = true;

        // send a 401 response for invalid cart
        res.status(401).json({ err_msg: "Invalid cart!" });

        // break the loop
        break;
      }
    }
    // checks if error has been flagged
    if (errorFlag) {
      // returns to stop function from running
      return;
    }

    // map cart into a array of of promises
    const promises = cartItems.map((cartItem) =>
      productModel.getProductById(cartItem.id)
    );

    // get database's items from user's cart item id
    const dbCartItems = await Promise.all(promises);

    //  cursed validation of data
    for (let j = 0; j < dbCartItems.length; j += 1) {
      // Checks if all user's cart items exists
      if (dbCartItems[j].length < 1) {
        // flag error
        errorFlag = true;

        // send a 401 response as cart item does not exist
        res.status(401).json({
          err_msg:
            "Cart Items' ID cannot be verified, please clear the cart and try again!",
        });
        // break the loop
        break;
      }

      // Check if the db item and user cart item have the same name
      if (dbCartItems[j][0].name !== cartItems[j].name) {
        // Flag error
        errorFlag = true;

        // Send a 401 response as the cart item's name are different
        res.status(401).json({
          err_msg:
            "Cart Items' Name cannot be verified, please clear the cart and try again!",
        });
        // break the loop
        break;
      }

      // Check if there are enough stock for the user's checkout request
      if (cartItems[j].quantity > dbCartItems[j][0].stock_qty) {
        // Flag error
        errorFlag = true;

        // send a 401 response as there are insuffient stock for user
        res.status(401).json({
          err_msg: `${cartItems[j].name} does not have enough stock! Enter a quantity lower than ${dbCartItems[j][0].stock_qty} for ${cartItems[j].name}`,
        });
        break;
      }
      // End of loop
    }

    // checks if error has been flagged
    if (errorFlag) {
      return;
    }

    // Cart passes all check, start to prepare stripe checkout session

    // Declare empty array for checkout session's line item
    const lineItemData = [];

    // loop through the cart
    for (let k = 0; k < cartItems.length; k += 1) {
      // Push a product to line item array with the neccessary properties
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
      // End of loop
    }

    // Create a new stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItemData,
      invoice_creation: {
        enabled: true,
      },
      mode: "payment",
      success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    // Record the stripe session id into the database with its cart items after check session has been created
    stripeSessionModel.createSession(
      session.id,
      JSON.stringify(cartItems),
      customerId
    );

    // send url of stripe checkout session
    res.status(303).json({ url: session.url });
  } catch (err) {
    // An error got caught, log it
    console.error("Error: ", err);

    // Send a 500 response
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
