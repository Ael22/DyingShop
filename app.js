/* eslint-disable camelcase */
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
      const sig = req.headers["stripe-signature"];

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.log("Error: ", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const checkoutSessionCompleted = event.data.object;
          const cartItems = await stripeSessionModel.getCartItemsBySessionID(
            checkoutSessionCompleted.id
          );
          const { checkout_items } = cartItems;
          const updatePromises = [];
          for (let i = 0; i < checkout_items.length; i += 1) {
            const itemId = checkout_items[i].id;
            const itemQty = checkout_items[i].quantity;
            updatePromises.push(() =>
              productModel.updateProductStock(itemId, itemQty)
            );
          }
          Promise.all(updatePromises.map((f) => f()))
            .then(() => {
              console.log("Stocks updating complete");
              stripeSessionModel.deleteSessionBySessionID(
                checkoutSessionCompleted.id
              );
            })
            .catch((err) => {
              throw err;
            });
          break;
        }
        // ... handle other event types
        case "checkout.session.expired": {
          const checkoutSessionExpired = event.data.object;
          stripeSessionModel.deleteSessionBySessionID(
            checkoutSessionExpired.id
          );
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      res.send();
    } catch (err) {
      console.error(err);
      res.status(500).send(`Internal Server Error`);
    }
  }
);

app.use(express.json()); // to process JSON in request body

app.use("/api", apiRouter);

app.use("/admin/verify", verifyToken, (req, res) => {
  res.status(200).json({ success_msg: `User verified` });
});
app.use("/admin/dashboard", verifyToken);
app.use("/uploads/", express.static("./uploads/"));

app.get("/success", async (req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { session_id } = req.query;
    if (!session_id) {
      throw Error("Session not found");
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.status !== "complete") {
      throw Error("User session not completed");
    }

    res.sendFile(`${__dirname}/public/success/index.html`);
  } catch (err) {
    console.error("error: ", err);
    res.status(404).send("<p>Page not found</p>");
  }
});

app.get("/cancel", async (req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { session_id } = req.query;
    if (!session_id) {
      res.status(404).send("<p>Page not found</p>");
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    await stripe.checkout.sessions.expire(session.id);

    res.redirect("/");
  } catch (err) {
    console.error("error: ", err);
    res.status(404).send("<p>Page not found</p>");
  }
});

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
