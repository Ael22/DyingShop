/* eslint-disable camelcase */

// Import libraries, models and routes
const express = require("express");
const createHttpError = require("http-errors");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const stripeSessionModel = require("./models/stripeSession");
const productModel = require("./models/product");

const verifyToken = require("./auth/verifyToken");

const apiRouter = require("./routes/api");

const app = express();

// Webhook to receive stripe's payment succeed and update the database
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // Retrieve stripe's signature for verification
      const sig = req.headers["stripe-signature"];

      // initialize event
      let event;

      try {
        // Retrieve the event from the body with the stripe signature and webhook secret
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        // An error got caught, log it
        console.log("Error: ", err);

        // Send 400 response as error occured trying to retreive event
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Handle the event
      switch (event.type) {
        // Handle event where a checkout session status becomes completed
        case "checkout.session.completed": {
          const checkoutSessionCompleted = event.data.object;

          // Get cart items from checkout session id from the database
          const cartItems = await stripeSessionModel.getCartItemsBySessionID(
            checkoutSessionCompleted.id
          );
          // Deconstruct checkout_items array from cartItems
          const { checkout_items } = cartItems;

          // Declare empty array to store async functions to be run
          const updatePromises = [];

          // Loop through checkout_items array
          for (let i = 0; i < checkout_items.length; i += 1) {
            // Get current index checkout_item's id and qty
            const itemId = checkout_items[i].id;
            const itemQty = checkout_items[i].quantity;

            // Push a function that runs an async function that updates the product stock on the database
            updatePromises.push(() =>
              productModel.updateProductStock(itemId, itemQty)
            );
            // End of loop
          }
          Promise.all(updatePromises.map((f) => f()))
            .then(() => {
              console.log("Stocks updating complete");
              stripeSessionModel.deleteSessionBySessionID(
                checkoutSessionCompleted.id
              );
            })
            .catch((err) => {
              // Throw caught error
              throw err;
            });
          break;
        }
        // Handle event where a checkout session status becomes expired
        case "checkout.session.expired": {
          const checkoutSessionExpired = event.data.object;

          // Deletes checkout session id record stored in the database
          stripeSessionModel
            .deleteSessionBySessionID(checkoutSessionExpired.id)
            .then(() => {
              console.log("Deleted expired checkout session");
            });
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receiving of the event
      res.status(200).end();
    } catch (err) {
      // An error got caught, log it
      console.error(err);
      // Send a 500 response
      res.status(500).send(`Internal Server Error`);
    }
  }
);

app.use(express.json()); // to process JSON in request body

// connecting routes
app.use("/api", apiRouter);

// Mount verifyToken middleware for admin site
app.use("/admin/dashboard", verifyToken);

// Serve images
app.use("/uploads/", express.static("./uploads/"));

// success endpoint to check for success
app.get("/success", async (req, res) => {
  try {
    // Get session id from query
    const { session_id } = req.query;

    // check if session id exists
    if (!session_id) {
      // Throw session not found error
      throw Error("Session not found");
    }

    // Retrieve checkout session from session id
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check is session status is completed
    if (session.status !== "complete") {
      // Throw session not completed error
      throw Error("Session not completed");
    }

    // All checks passed show user the success page
    res.sendFile(`${__dirname}/public/success/index.html`);
  } catch (err) {
    // An error got caught, log it
    console.error("error: ", err);

    // Send a 404 response
    res.status(404).send("<p>Page not found</p>");
  }
});

// cancel endpoint for when user cancels their checkout
app.get("/cancel", async (req, res) => {
  try {
    // Get session id from query
    const { session_id } = req.query;

    // check if session id exists
    if (!session_id) {
      // Throw session not found error
      throw Error("Session not found");
    }

    // Retrieve checkout session from session id
    stripe.checkout.sessions.retrieve(session_id).then((session) => {
      // Expire the session
      stripe.checkout.sessions.expire(session.id);
    });

    // Finally redirect user to home page
    res.redirect("/");
  } catch (err) {
    // An error got caught, log it
    console.error("error: ", err);

    // Send a 404 response
    res.status(404).send("<p>Page not found</p>");
  }
});

// Serve web pages to users
app.use(express.static("public"));

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
