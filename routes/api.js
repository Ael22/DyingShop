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

router.post("/resetpassword", async (req, res) => {
  const { email } = req.body;
  if (!emailRegex.test(email)) {
    res.status(400).json({ err_msg: "Invalid Email" });
    return;
  }
  // email template from postmark => https://github.com/ActiveCampaign/postmark-templates/tree/main
  // but modified for this project's use
  const userAgent = req.headers["user-agent"];

  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();

  let userOS;
  let userBrowser;

  if (!result.os.name || !result.os.version) {
    userOS = result.ua;
  } else {
    userOS = `${result.os.name} ${result.os.version}`;
  }
  if (!result.browser.name || !result.browser.version) {
    userBrowser = result.ua;
  } else {
    userBrowser = `${result.browser.name} ${result.browser.version}`;
  }

  console.log(result);

  const mailOptions = {
    from: `${process.env.EMAIL_SENDER}`,
    to: "hohweide@gmail.com",
    subject: "Test Email from Node.js and Mailtrap",
    text: `
      Use this link to reset your password. The link is only valid for 24 hours.

      [ADES Dying Shop] ( ${process.env.DOMAIN} )

      ************
      Hi {{name}},
      ************

      You recently requested to reset your password for your [Product Name] account. Use the button below to reset it. This password reset is only valid for the next 24 hours.

      Reset your password ( {{ action_url }} )

      For security, this request was received from a ${userOS} device using ${userBrowser}. If you did not request a password reset, you dead lol.

      Thanks,
      The Dying Shop team

      If you’re having trouble with the button above, copy and paste the URL below into your web browser.

      {{action_url}}

      [Dying Shop, idk]

      1234 Street Rd.

      Suite 1234`,
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <title></title>
      <style type="text/css" rel="stylesheet" media="all">
      /* Base ------------------------------ */

      @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
      body {
        width: 100% !important;
        height: 100%;
        margin: 0;
        -webkit-text-size-adjust: none;
      }

      a {
        color: #3869D4;
      }

      a img {
        border: none;
      }

      td {
        word-break: break-word;
      }

      .preheader {
        display: none !important;
        visibility: hidden;
        mso-hide: all;
        font-size: 1px;
        line-height: 1px;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
      }
      /* Type ------------------------------ */

      body,
      td,
      th {
        font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
      }

      h1 {
        margin-top: 0;
        color: #333333;
        font-size: 22px;
        font-weight: bold;
        text-align: left;
      }

      h2 {
        margin-top: 0;
        color: #333333;
        font-size: 16px;
        font-weight: bold;
        text-align: left;
      }

      h3 {
        margin-top: 0;
        color: #333333;
        font-size: 14px;
        font-weight: bold;
        text-align: left;
      }

      td,
      th {
        font-size: 16px;
      }

      p,
      ul,
      ol,
      blockquote {
        margin: .4em 0 1.1875em;
        font-size: 16px;
        line-height: 1.625;
      }

      p.sub {
        font-size: 13px;
      }
      /* Utilities ------------------------------ */

      .align-right {
        text-align: right;
      }

      .align-left {
        text-align: left;
      }

      .align-center {
        text-align: center;
      }

      .u-margin-bottom-none {
        margin-bottom: 0;
      }
      /* Buttons ------------------------------ */

      .button {
        background-color: #3869D4;
        border-top: 10px solid #3869D4;
        border-right: 18px solid #3869D4;
        border-bottom: 10px solid #3869D4;
        border-left: 18px solid #3869D4;
        display: inline-block;
        color: #FFF;
        text-decoration: none;
        border-radius: 3px;
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
        -webkit-text-size-adjust: none;
        box-sizing: border-box;
      }

      .button--green {
        background-color: #22BC66;
        border-top: 10px solid #22BC66;
        border-right: 18px solid #22BC66;
        border-bottom: 10px solid #22BC66;
        border-left: 18px solid #22BC66;
      }

      .button--red {
        background-color: #FF6136;
        border-top: 10px solid #FF6136;
        border-right: 18px solid #FF6136;
        border-bottom: 10px solid #FF6136;
        border-left: 18px solid #FF6136;
      }

      @media only screen and (max-width: 500px) {
        .button {
          width: 100% !important;
          text-align: center !important;
        }
      }
      /* Attribute list ------------------------------ */

      .attributes {
        margin: 0 0 21px;
      }

      .attributes_content {
        background-color: #F4F4F7;
        padding: 16px;
      }

      .attributes_item {
        padding: 0;
      }
      /* Related Items ------------------------------ */

      .related {
        width: 100%;
        margin: 0;
        padding: 25px 0 0 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }

      .related_item {
        padding: 10px 0;
        color: #CBCCCF;
        font-size: 15px;
        line-height: 18px;
      }

      .related_item-title {
        display: block;
        margin: .5em 0 0;
      }

      .related_item-thumb {
        display: block;
        padding-bottom: 10px;
      }

      .related_heading {
        border-top: 1px solid #CBCCCF;
        text-align: center;
        padding: 25px 0 10px;
      }
      /* Discount Code ------------------------------ */

      .discount {
        width: 100%;
        margin: 0;
        padding: 24px;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        background-color: #F4F4F7;
        border: 2px dashed #CBCCCF;
      }

      .discount_heading {
        text-align: center;
      }

      .discount_body {
        text-align: center;
        font-size: 15px;
      }
      /* Social Icons ------------------------------ */

      .social {
        width: auto;
      }

      .social td {
        padding: 0;
        width: auto;
      }

      .social_icon {
        height: 20px;
        margin: 0 8px 10px 8px;
        padding: 0;
      }
      /* Data table ------------------------------ */

      .purchase {
        width: 100%;
        margin: 0;
        padding: 35px 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }

      .purchase_content {
        width: 100%;
        margin: 0;
        padding: 25px 0 0 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }

      .purchase_item {
        padding: 10px 0;
        color: #51545E;
        font-size: 15px;
        line-height: 18px;
      }

      .purchase_heading {
        padding-bottom: 8px;
        border-bottom: 1px solid #EAEAEC;
      }

      .purchase_heading p {
        margin: 0;
        color: #85878E;
        font-size: 12px;
      }

      .purchase_footer {
        padding-top: 15px;
        border-top: 1px solid #EAEAEC;
      }

      .purchase_total {
        margin: 0;
        text-align: right;
        font-weight: bold;
        color: #333333;
      }

      .purchase_total--label {
        padding: 0 15px 0 0;
      }

      body {
        background-color: #F2F4F6;
        color: #51545E;
      }

      p {
        color: #51545E;
      }

      .email-wrapper {
        width: 100%;
        margin: 0;
        padding: 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        background-color: #F2F4F6;
      }

      .email-content {
        width: 100%;
        margin: 0;
        padding: 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }
      /* Masthead ----------------------- */

      .email-masthead {
        padding: 25px 0;
        text-align: center;
      }

      .email-masthead_logo {
        width: 94px;
      }

      .email-masthead_name {
        font-size: 16px;
        font-weight: bold;
        color: #A8AAAF;
        text-decoration: none;
        text-shadow: 0 1px 0 white;
      }
      /* Body ------------------------------ */

      .email-body {
        width: 100%;
        margin: 0;
        padding: 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }

      .email-body_inner {
        width: 570px;
        margin: 0 auto;
        padding: 0;
        -premailer-width: 570px;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        background-color: #FFFFFF;
      }

      .email-footer {
        width: 570px;
        margin: 0 auto;
        padding: 0;
        -premailer-width: 570px;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        text-align: center;
      }

      .email-footer p {
        color: #A8AAAF;
      }

      .body-action {
        width: 100%;
        margin: 30px auto;
        padding: 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        text-align: center;
      }

      .body-sub {
        margin-top: 25px;
        padding-top: 25px;
        border-top: 1px solid #EAEAEC;
      }

      .content-cell {
        padding: 45px;
      }
      /*Media Queries ------------------------------ */

      @media only screen and (max-width: 600px) {
        .email-body_inner,
        .email-footer {
          width: 100% !important;
        }
      }

      @media (prefers-color-scheme: dark) {
        body,
        .email-body,
        .email-body_inner,
        .email-content,
        .email-wrapper,
        .email-masthead,
        .email-footer {
          background-color: #333333 !important;
          color: #FFF !important;
        }
        p,
        ul,
        ol,
        blockquote,
        h1,
        h2,
        h3,
        span,
        .purchase_item {
          color: #FFF !important;
        }
        .attributes_content,
        .discount {
          background-color: #222 !important;
        }
        .email-masthead_name {
          text-shadow: none !important;
        }
      }

      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      </style>
      <!--[if mso]>
      <style type="text/css">
        .f-fallback  {
          font-family: Arial, sans-serif;
        }
      </style>
    <![endif]-->
    </head>
    <body>
      <span class="preheader">Use this link to reset your password. The link is only valid for 24 hours.</span>
      <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td class="email-masthead">
                  <a href="${process.env.DOMAIN}" class="f-fallback email-masthead_name">
                  ADES Dying Shop
                </a>
                </td>
              </tr>
              <!-- Email Body -->
              <tr>
                <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                  <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                    <!-- Body content -->
                    <tr>
                      <td class="content-cell">
                        <div class="f-fallback">
                          <h1>Hi {{name}},</h1>
                          <p>You recently requested to reset your password for your Dying Shop account. Use the button below to reset it. <strong>This password reset is only valid for the next 24 hours.</strong></p>
                          <!-- Action -->
                          <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center">
                                <!-- Border based button
             https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                  <tr>
                                    <td align="center">
                                      <a href="{{action_url}}" class="f-fallback button button--green" target="_blank">Reset your password</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <p>For security, this request was received from a ${userOS} device using ${userBrowser}. If you did not request a password reset, you dead lol.</p>
                          <p>Thanks,
                            <br>The Dying Shop team</p>
                          <!-- Sub copy -->
                          <table class="body-sub" role="presentation">
                            <tr>
                              <td>
                                <p class="f-fallback sub">If you’re having trouble with the button above, copy and paste the URL below into your web browser.</p>
                                <p class="f-fallback sub">{{action_url}}</p>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td class="content-cell" align="center">
                        <p class="f-fallback sub align-center">
                          [Dying Shop, idk]
                          <br>1234 Street Rd.
                          <br>Suite 1234
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
    `,
  };

  // transport
  //   .sendMail(mailOptions)
  //   .then((info) => {
  //     console.log("Email sent: ", info.statusCode);
  //     res.status(200).json({ message: info.statusMessage });
  //   })
  //   .catch((err) => {
  //     console.log("Errors occurred, failed to deliver message");

  //     if (err.response && err.response.body && err.response.body.errors) {
  //       err.response.body.errors.forEach((error) =>
  //         console.log("%s: %s", error.field, error.message)
  //       );
  //     } else {
  //       console.log(err);
  //     }
  //     res.status(500).json({ err_msg: "Internal server error" });
  //   });
});

module.exports = router;
