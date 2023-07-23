const express = require("express");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid");
const customerModel = require("../models/customer");
const verifyToken = require("../auth/verifyCustomerToken");
const orderModel = require("../models/order");

const router = express.Router();

// nodemailer transport
const transport = nodemailer.createTransport(
  // * FOR PRODUCTION
  // nodemailerSendgrid({
  //   apiKey: process.env.SENDGRID_API_KEY,
  // }),
  {
    // ! USE MAILTRAP FOR TESTING
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  }
);

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

router.post("/verifyemail", (req, res) => {
  try {
    // TODO: verified users cant do this

    const token = req.headers.cookie.replace("token=", "");
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err, decodedToken) {
        const { id } = decodedToken;
        const check = await customerModel.checkEmailVerification(id);
        if (check) {
          res.status(400).json({ err_msg: "User is already verified" });
          return;
        }

        customerModel
          .getCustomerById(id)
          .then((result) => {
            const { email } = result;

            customerModel
              .updateVerifyToken(id)
              .then((emailToken) => {
                if (!emailToken) {
                  res.status(500).json({ err_msg: "Error generating token" });
                  return;
                }
                // Email template from mailmeteor => https://mailmeteor.com/email-templates/email-address-verification#viewsource
                // modified for project use
                const mailOptions = {
                  from: `${process.env.EMAIL_SENDER}`,
                  to: `${email}`,
                  subject: "Verify E-mail for Dying Shop",
                  text: `i forgor link`,
                  html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Please activate your account</title>
              <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
            </head>
            
            <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
              <table role="presentation"
                style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
                <tbody>
                  <tr>
                    <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
                      <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                        <tbody>
                          <tr>
                            <td style="padding: 40px 0px 0px;">
                              <div style="text-align: left;">
                                <h1>Dying Shop</h1>
                              </div>
                              <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                                <div style="color: rgb(0, 0, 0); text-align: left;">
                                  <h1 style="margin: 1rem 0">Final step...</h1>
                                  <p style="padding-bottom: 16px">Follow this link to verify your email address.</p>
                                  <p style="padding-bottom: 16px"><a href="${process.env.DOMAIN}/api/verifyemail/${emailToken}" target="_blank"
                                      style="padding: 12px 24px; border-radius: 4px; color: #FFF; background: #2B52F5;display: inline-block;margin: 0.5rem 0;">Confirm
                                      now</a></p>
                                  <p style="padding-bottom: 16px">If you didn’t ask to verify this address, you can ignore this email.</p>
                                  <p style="padding-bottom: 16px">Thanks,<br>The Dying Shop</p>
                                </div>
                              </div>
                              <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                                <p style="padding-bottom: 16px">Made with ♥ in Paris</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </body>
            
            </html>`,
                };

                transport
                  .sendMail(mailOptions)
                  .then((info) => {
                    console.log("Email sent: ", info.statusCode);
                    res.status(200).json({
                      success_msg:
                        "An email has been sent. Link is valid for 24 hours.",
                    });
                  })
                  .catch((err1) => {
                    console.log(
                      "Errors occurred, failed to deliver message: ",
                      err1
                    );

                    res.status(500).json({ err_msg: "Internal server error" });
                  });
              })
              .catch((tokenError) => {
                throw tokenError;
              });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ err_msg: "Internal server error" });
          });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
