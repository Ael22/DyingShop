const express = require("express");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const customerModel = require("../models/customer");
const verifyToken = require("../auth/verifyCustomerToken");
const orderModel = require("../models/order");

const router = express.Router();

const emailRegex = /^\S+@\S+\.\S+$/;
const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const textRegex = /^[a-zA-Z ]+$/;

router.use("/", verifyToken);

router.get("/", (req, res) => {
  try {
    const token = req.headers.cookie.replace("token=", "");
    jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
      const { id } = decoded;
      customerModel
        .getCustomerById(id)
        .then((result) => {
          res.status(200).json({ user: result });
        })
        .catch((error) => {
          throw error;
        });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const token = req.headers.cookie.replace("token=", "");

    // JWT token exists, so verify it
    // eslint-disable-next-line consistent-return
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw err;
      }
      const { id } = decoded;
      const {
        email,
        password,
        newPassword,
        confirmPassword,
        firstName,
        lastName,
      } = req.body;

      if (!emailRegex.test(email)) {
        res.status(400).json({ err_msg: "Invalid Email" });
        return;
      }
      if (!textRegex.test(firstName)) {
        res.status(400).json({ err_msg: "Invalid First Name" });
        return;
      }
      if (!textRegex.test(lastName)) {
        res.status(400).json({ err_msg: "Invalid Last Name" });
        return;
      }
      if (!password) {
        res.status(400).json({ err_msg: "Missing Password" });
        return;
      }
      if (!passwordRegex.test(newPassword)) {
        res.status(400).json({ err_msg: "Invalid New Password" });
        return;
      }
      if (newPassword !== confirmPassword) {
        res
          .status(400)
          .json({ err_msg: "New password does not match confirm password" });
        return;
      }
      customerModel
        .updateCustomer(firstName, lastName, email, password, newPassword, id)
        .then((result) => {
          if (!result) {
            res.status(400).json({ err_msg: `Update Failed` });
          } else {
            res.status(200).json({ success_msg: `Update Success` });
          }
        })
        .catch((updateError) => {
          if (updateError.message === "Invalid Password") {
            res.status(400).json({ err_msg: "Invalid Password" });
          } else {
            res.status(500).json({ err_msg: "Internal server error" });
          }
        });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const token = req.headers.cookie.replace("token=", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw err;
      }
      const { id } = decoded;

      customerModel
        .deleteCustomer(id)
        .then((result) => {
          if (!result) {
            res.status(500).json({ err_msg: "Deletion failed" });
          }
          res.status(200).json({ success_msg: "Account deleted" });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ err_msg: "Internal server error" });
        });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.get("/orders", (req, res) => {
  try {
    const token = req.headers.cookie.replace("token=", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw err;
      }

      const customerId = decoded.id;

      orderModel
        .getOrdersByCustomerId(customerId)
        .then((result) => {
          if (result.length < 1) {
            res.status(200).json({ orders: [] });
            return;
          }
          const paymentIntentPromises = [];
          for (let i = 0; i < result.length; i += 1) {
            paymentIntentPromises.push(() =>
              stripe.paymentIntents.retrieve(result[i].stripe_id)
            );
          }

          Promise.all(paymentIntentPromises.map((f) => f()))
            .then((stripePaymentIntentResults) => {
              const paymentMethodPromises = [];
              for (let j = 0; j < stripePaymentIntentResults.length; j += 1) {
                paymentMethodPromises.push(() =>
                  stripe.paymentMethods.retrieve(
                    stripePaymentIntentResults[j].payment_method
                  )
                );
              }

              Promise.all(paymentMethodPromises.map((f) => f()))
                .then((stripePaymentMethodResults) => {
                  const responseMessage = [];
                  for (
                    let k = 0;
                    k < stripePaymentMethodResults.length;
                    k += 1
                  ) {
                    responseMessage.push({
                      items: result[k].checkout_items,
                      payment_method: stripePaymentMethodResults[k].card.brand,
                      payment_amount: (
                        stripePaymentIntentResults[k].amount / 100
                      ).toFixed(2),
                      currency: stripePaymentIntentResults[k].currency,
                      date: new Date(result[k].created_at * 1000),
                      refund: !!result[k].refund,
                    });
                  }
                  res.status(200).json({ orders: responseMessage });
                })
                .catch((error) => {
                  throw error;
                });

              // const responseMessage = [];
              // for (let j = 0; j < stripeResults.length; j += 1) {
              //   responseMessage.push({
              //     items: result[j].checkout_items,
              //     date: new Date(stripeResults[j].created * 1000),
              //     paymentMethod: stripeResults[j].
              //   });
              // }
            })
            .catch((error) => {
              console.log(error);
              res.status(500).json({ err_msg: "Error fetching stripe" });
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ err_msg: "Internal server error" });
        });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
