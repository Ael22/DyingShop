/* eslint-disable no-unused-vars */
// Import libraries, router, models and routes
const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid");
const UAParser = require("ua-parser-js");

const router = express.Router();

const categoryModel = require("../models/category");
const productModel = require("../models/product");
const customerModel = require("../models/customer");

const loginRoutes = require("./admin/login");
const categoryRoutes = require("./admin/category");
const productRoutes = require("./admin/product");
const checkoutRoutes = require("./checkout");
const customerAdminRoutes = require("./admin/customer");
const orderAdminRoutes = require("./admin/order");
const customerRoutes = require("./customer");
const statisticRoutes = require("./admin/statistics");

// nodemailer transport
const transport = nodemailer.createTransport(
  // * FOR PRODUCTION
  nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY,
  })
  // {
  //   // ! USE MAILTRAP FOR TESTING
  //   host: "sandbox.smtp.mailtrap.io",
  //   port: 2525,
  //   auth: {
  //     user: process.env.MAILTRAP_USER,
  //     pass: process.env.MAILTRAP_PASSWORD,
  //   },
  // }
);

// regex
const emailRegex = /^\S+@\S+\.\S+$/;
const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const textRegex = /^[a-zA-Z ]+$/;

// Connect all routes
router.use("/admin", loginRoutes);
router.use("/admin", categoryRoutes);
router.use("/admin", productRoutes);
router.use("/admin", customerAdminRoutes);
router.use("/admin", orderAdminRoutes);
router.use("/admin", statisticRoutes);

router.use("/user", customerRoutes);

router.use("/checkout", checkoutRoutes);

router.get("/category", (req, res) => {
  try {
    // Get categories then send the results
    categoryModel.getAllCategories().then((result) => {
      if (result) {
        res.status(200).json({ categories: result });
      }
    });
  } catch (err) {
    // An error got caught, log it
    console.log(err);

    // send a 500 response
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.get("/category/:id", (req, res) => {
  try {
    // Get id from the request parameters
    const { id } = req.params;

    // check if id exists
    if (!id) {
      // Send a 400 response for invalid id
      res.status(400).json({ err_msg: "id is invalid!" });
      return;
    }

    // Get the requested category
    categoryModel
      .getCategoryById(id)
      .then((result) => {
        // if no result is found
        if (result.length < 1) {
          // send a 404 response for category not found
          res.status(404).json({ err_msg: "category not found" });
          return;
        }
        // send result
        res.status(200).json({ category: result[0] });
      })
      .catch((err) => {
        // An error got caught, log it
        console.error("Error :", err);

        // throw caught error
        throw err;
      });
  } catch (err) {
    // Send a 500 response
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.get("/product", (req, res) => {
  const { categoryId } = req.query;
  if ( !categoryId) {
    // Get all products and send the result
    productModel
      .getAllProducts()
      .then((result) => {
        res.status(200).json({ products: result });
      })
      .catch((err) => {
        // An error got caught, log it
        console.error("Error :", err);

        // Send a 500 response
        res.status(500).json({ err_msg: "Internal server error" });
      });
  } else {
    productModel
      .getProductByCategoryId(categoryId)
      .then((result) => {
        res.status(200).json({ products: result });
      })
      .catch((err) => {
        // An error got caught, log it
        console.error("Error :", err);

        // Send a 500 response
        res.status(500).json({ err_msg: "Internal server error" });
      });
  }
});

router.get("/product/:id", (req, res) => {
  try {
    // Get id from request parameters
    const { id } = req.params;

    // check if id exists
    if (!id) {
      // send a 404 response for category not found
      res.status(400).json({ err_msg: "id is invalid" });
      return;
    }
    productModel.getProductById(id).then((result) => {
      // if no result is found
      if (result.length < 1) {
        // send a 404 response for product not found
        res.status(404).json({ err_msg: "Product not found" });
        return;
      }
      // send result
      res.status(200).json({ product: result[0] });
    });
  } catch (err) {
    // Send a 500 response
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
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
    if (!passwordRegex.test(password)) {
      res.status(400).json({ err_msg: "Invalid Password" });
      return;
    }
    if (
      await customerModel.createCustomer(firstName, lastName, email, password)
    ) {
      res.status(200).json({ success_msg: "Sign up success" });
    } else {
      throw Error;
    }
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ err_msg: "Email Has Already Been Taken" });
      return;
    }
    // Send a 500 response
    console.log(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!emailRegex.test(email)) {
      res.status(400).json({ err_msg: "Invalid Email" });
      return;
    }
    if (!password) {
      res.status(400).json({ err_msg: "Missing Password" });
      return;
    }
    const token = await customerModel.loginCustomer(email, password);
    res.cookie("token", token, { httpOnly: false }).status(200).json({ token });
    // res.status(200).json({ success_msg: "Sign in success" });
  } catch (err) {
    // Send a 500 response
    if (err.message === "Invalid Email or Password") {
      res.status(400).json({ err_msg: err.message });
      return;
    }
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.post("/verifyCustomer", (req, res) => {
  if (!req.headers.cookie) {
    // cookie does not exist so send user a 403 response
    res.status(403).json({ err_msg: "Cookie does not exist!" });
    return;
  }

  // Retrieve JWT token from cookies
  const token = req.headers.cookie.replace("token=", "");
  // Checks if JWT token exists
  if (!token) {
    // JWT Token does not exist so send user a 403 response
    res.status(403).json({ err_msg: "Token does not exist!" });
    return;
  }

  // JWT token exists, so verify it
  // eslint-disable-next-line consistent-return
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    // if theres an error verifying the token
    if (err) {
      if (err.name === "TokenExpiredError") {
        res.status(403).json({ err_msg: "Token expired" });
        return;
      }
      // log the error and redirect user
      console.log(err);
      res.status(403).json({ err_msg: "User failed verified" });
      return;
    }

    // check if the decoded token contains admin authentication
    if (!decoded.adminAuth) {
      // token does not contain admin authentication so its a customer
      res.status(200).json({ success_msg: "User verified!" });
    }
  });
});

router.get("/verifyemail/:token", (req, res) => {
  try {
    const { token } = req.params;
    console.log(token);
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err);
        if (err.name === "TokenExpiredError") {
          res.status(400).send("Token expired");
        } else if (
          err.name === "JsonWebTokenError" ||
          err.name === "NotBeforeError"
        ) {
          res.status(400).send("Invalid token.");
        } else {
          res.status(400).send("Error verifying token:", err.message);
        }
      } else {
        console.log(`Verify token decoded for user with id ${decodedToken.id}`);
        customerModel.verifyEmail(token, decodedToken.id).then((result) => {
          if (!result) {
            res.status(400).send("Token not found");
            return;
          }
          res.status(200).send("user verified!");
        });
      }
    });
  } catch (error) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

router.post("/verifyResetToken", (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    res.sendStatus(200);
  });
});

router.post("/resetpassword/request", async (req, res) => {
  const { email } = req.body;
  if (!emailRegex.test(email)) {
    res.status(400).json({ err_msg: "Invalid Email" });
    return;
  }

  customerModel
    .getCustomerByEmail(email)
    .then((customerResult) => {
      if (customerResult) {
        customerModel
          .updateResetToken(customerResult.email, customerResult.id)
          .then((updateResult) => {
            if (!updateResult) {
              res
                .status(500)
                .json({ err_msg: "Failed to create reset email token" });
              return;
            }

            const token = updateResult;

            // Email template from mailmeteor => https://mailmeteor.com/email-templates/email-address-verification#viewsource
            // modified for project use
            const mailOptions = {
              from: `${process.env.EMAIL_SENDER}`,
              to: `${customerResult.email}`,
              subject: "Reset Dying Shop Account Password",
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
                      <h1 style="margin: 1rem 0">Reset Password</h1>
                      <p style="padding-bottom: 16px">Follow this link to reset your password.</p>
                      <p style="padding-bottom: 16px"><a href="${process.env.DOMAIN}/reset/token?tokenId=${token}" target="_blank"
                          style="padding: 12px 24px; border-radius: 4px; color: #FFF; background: #2B52F5;display: inline-block;margin: 0.5rem 0;">Reset Password</a>
                      </p>
                      <p style="padding-bottom: 16px">If you didn’t ask to reset password, you can ignore this email.</p>
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
                console.log("Email sent: ", info[0].statusCode);
                res.status(200).json({
                  success_msg: `If a matching & verified account was found an email was sent to ${email} to allow you to reset your password.`,
                });
              })
              .catch((transportError) => {
                throw transportError;
              });
          })
          .catch((updateError) => {
            throw updateError;
          });
      } else {
        // set time out so emails that are not verified won't be known as they non-verified users emails will
        // make the code send a response immediately
        setTimeout(() => {
          res.status(200).json({
            success_msg: `If a matching & verified account was found an email was sent to ${email} to allow you to reset your password.`,
          });
        }, Math.random() * (6800 - 4800 + 1) + 4800);
      }
    })
    .catch((emailError) => {
      console.error(emailError);
      res.status(200).json({
        success_msg: `If a matching & verified account was found an email was sent to ${email} to allow you to reset your password.`,
      });
    });
});

router.post("/resetpassword", (req, res) => {
  const { token } = req.body;
  const newPassword = req.body.new_password;
  const confirmPassword = req.body.confirm_password;

  if (newPassword !== confirmPassword) {
    res.status(400).json({ err_msg: "Passwords does not match" });
    return;
  }
  if (!passwordRegex.test(newPassword)) {
    res.status(400).json({ err_msg: "Invalid New Password" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(400).json({ err_msg: "Token cannot be verified" });
      return;
    }
    customerModel
      .changePassword(newPassword, token, decoded.id)
      .then((result) => {
        if (!result) {
          res
            .status(500)
            .json({ err_msg: "Error occured while changing password" });
          return;
        }
        res.status(200).json({ success_msg: "Password has been changed" });
      })
      .catch((error) => {
        console.error(error);
        res
          .status(500)
          .json({ err_msg: "Error occured while changing password" });
      });
  });
});

router.get("/verifyAdmin", (req, res) => {
  if (!req.headers.cookie) {
    // cookie does not exist so send user a 403 response
    res.status(403).json({ err_msg: "Cookie does not exist!" });
    return;
  }

  // Retrieve JWT token from cookies
  const token = req.headers.cookie.replace("token=", "");

  // Checks if JWT token exists
  if (!token) {
    // JWT Token does not exist so send user a 403 response
    res.status(403).json({ err_msg: "Token does not exist!" });
    return;
  }

  // JWT token exists, so verify it
  // eslint-disable-next-line consistent-return
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    // if theres an error verifying the token
    if (err) {
      // log the error and redirect user
      console.log(err);
      res.status(403).json({ err_msg: "Forbidden" });
      return;
    }
    // check if the decoded token contains admin authentication
    if (!decoded.adminAuth) {
      // token does not contain admin authentication so send a 401 response
      console.log("user not admin");
      res.status(403).json({ err_msg: "Forbidden" });
      return;
    }
    res.sendStatus(200);
  });
});

module.exports = router;
