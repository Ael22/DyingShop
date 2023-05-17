const express = require("express");

const router = express.Router();

const categoryModel = require("../models/category");
const productModel = require("../models/product");

const loginRoutes = require("./admin/login");
const categoryRoutes = require("./admin/category");
const productRoutes = require("./admin/product");

router.get("/router/test", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

router.use("/admin", loginRoutes);
router.use("/admin", categoryRoutes);
router.use("/admin", productRoutes);

router.get("/category", (req, res) => {
  try {
    categoryModel.getAllCategories().then((result) => {
      if (result) {
        res.status(200).json({ categories: result });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.get("/category/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ err_msg: "id is invalid!" });
      return;
    }
    categoryModel
      .getCategoryById(id)
      .then((result) => {
        if (result.length < 1) {
          res.status(404).json({ err_msg: "category not found" });
          return;
        }
        res.status(200).json({ category: result[0] });
      })
      .catch((err) => {
        console.error("Error :", err);
        res.status(500).json({ err_msg: "Internal server error" });
      });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.get("/product", (req, res) => {
  productModel
    .getAllProducts()
    .then((result) => {
      res.status(200).json({ products: result });
    })
    .catch((err) => {
      console.error("Error :", err);
      res.status(500).json({ err_msg: "Internal server error" });
    });
});

router.get("/product/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ err_msg: "id is invalid" });
      return;
    }
    productModel.getProductById(id).then((result) => {
      if (result.length < 1) {
        res.status(404).json({ err_msg: "Product not found" });
        return;
      }
      res.status(200).json({ product: result[0] });
    });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
