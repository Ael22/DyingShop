const express = require("express");

const verifyToken = require("../../auth/verifyToken");

const categoryModel = require("../../models/category");
const productModel = require("../../models/product");

const router = express.Router();

router.use("/product", verifyToken);

router.post("/product", (req, res) => {
  const { name, description, price, stockQty, categoryId } = req.body;
  if (!name || !description || !price || !stockQty || !categoryId) {
    res.status(400).json({
      err_msg:
        "name, description, price, stock quantity or catogory id is missing or incorrect!",
    });
    return;
  }

  categoryModel
    .getCategoryById(categoryId)
    .then((result) => {
      if (result.length < 1) {
        throw new Error(`Category Id ${categoryId} does not exist`);
      } else {
        productModel
          .createNewProduct(name, description, price, stockQty, categoryId)
          .then((result1) => {
            if (!result1) {
              res.status(400).json({ err_msg: "Failed to create product" });
            } else {
              res
                .status(200)
                .json({ success_msg: "Product successfully created" });
            }
          })
          .catch((err) => {
            console.error("Error :", err);
            res.status(500).json({ err_msg: "Internal server error" });
          });
      }
    })
    .catch((err) => {
      res.status(400).json({ err_msg: err.message });
    });
});

router.put("/product", async (req, res) => {
  const { id, name, description, price, stockQty, categoryId } = req.body;
  if (!id || !name || !description || !price || !stockQty || !categoryId) {
    res.status(400).json({
      err_msg:
        "id, name, description, price, stock quantity or catogory id is missing or incorrect!",
    });
    return;
  }
  const results = await Promise.all([
    productModel.getProductById(id),
    categoryModel.getCategoryById(categoryId),
  ]);

  if (results[0].length < 1) {
    res.status(400).json({ err_msg: `Product Id does not exist!` });
    return;
  }
  if (results[1].length < 1) {
    res.status(400).json({ err_msg: `Category Id does not exist!` });
    return;
  }

  productModel
    .updateProduct(id, name, description, price, stockQty, categoryId)
    .then((data) => {
      if (!data) {
        res
          .status(500)
          .json({ err_msg: `Failed to update product with ID ${id}` });
      } else {
        res.status(200).json({ success_msg: "Product successfully updated" });
      }
    })
    .catch((err) => {
      console.error("Error: ", err);
      res.status(500).json({ err_msg: "Internal server error" });
    });
});

router.delete("/product", (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ err_msg: "id is invalid" });
    return;
  }
  productModel
    .deleteProduct(id)
    .then((result) => {
      if (!result) {
        res
          .status(400)
          .json({ err_msg: `Failed to Delete product with ID ${id}` });
      }
      res.status(200).json({ success_msg: "Product successfully deleted" });
    })
    .catch((err) => {
      console.error("Error :", err);
      res.status(500).json({ err_msg: "Internal server error" });
    });
});

module.exports = router;