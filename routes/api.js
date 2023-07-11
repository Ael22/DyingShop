// Import libraries, router, models and routes
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const categoryModel = require("../models/category");
const productModel = require("../models/product");
const customerModel = require("../models/customer");

const loginRoutes = require("./admin/login");
const categoryRoutes = require("./admin/category");
const productRoutes = require("./admin/product");
const checkoutRoutes = require("./checkout");
const customerAdminRoutes = require("./admin/customer");
const customerRoutes = require("./customer");

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

module.exports = router;
