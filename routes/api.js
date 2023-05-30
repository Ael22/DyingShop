// Import libraries, router, models and routes
const express = require("express");

const router = express.Router();

const categoryModel = require("../models/category");
const productModel = require("../models/product");

const loginRoutes = require("./admin/login");
const categoryRoutes = require("./admin/category");
const productRoutes = require("./admin/product");
const checkoutRoutes = require("./checkout");

// Connect all routes
router.use("/admin", loginRoutes);
router.use("/admin", categoryRoutes);
router.use("/admin", productRoutes);

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

module.exports = router;
