/* eslint-disable no-console */
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const fs = require("fs").promises;
const stripe = require("stripe")(process.env.STRIPE_KEY);

const verifyToken = require("../../auth/verifyToken");

const categoryModel = require("../../models/category");
const productModel = require("../../models/product");
const { error } = require("console");

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: "2MB",
  },
});

router.use("/product", verifyToken);

router.get("/product/payment", async (req, res) => {
  // get all payment intents from stripe
  const paymentIntents = await stripe.paymentIntents.list();

  // declare variables for aggregation
  let totalSales = 0;
  let totalNumberOfSales = 0;

  // loop through data
  for (let i = 0; i < paymentIntents.data.length; i += 1) {
    // check if payment intent is relevant
    if (
      paymentIntents.data[i].status === "succeeded" &&
      paymentIntents.data[i].currency === "sgd"
    ) {
      // adds data to aggregation variables
      totalSales += paymentIntents.data[i].amount_received;
      totalNumberOfSales += 1;
    }
    // end of loop
  }

  // calculate sales
  totalSales = (totalSales / 100).toFixed(2);

  // send 200 response with sale info
  res.status(200).json({
    Total_Sales: totalSales,
    Number_of_Sales: totalNumberOfSales,
  });
});

router.post("/product", (req, res) => {
  // get the following data from request data
  const { name, description, price, stockQty, categoryId } = req.body;

  // check if the retrieved data exists
  if (!name || !description || !price || !stockQty || !categoryId) {
    // send a 400 response for missing data
    res.status(400).json({
      err_msg:
        "name, description, price, stock quantity or catogory id is missing or incorrect!",
    });
    return;
  }

  categoryModel
    .getCategoryById(categoryId)
    .then((result) => {
      // check if the product's category exists
      if (result.length < 1) {
        // throw error for no category found
        throw new Error(`Category Id ${categoryId} does not exist`);
      } else {
        // checks all passed now create a new product
        productModel
          .createNewProduct(name, description, price, stockQty, categoryId)
          .then((result1) => {
            // check if result creation failed
            if (!result1) {
              // send a 400 response for failed creation
              res.status(400).json({ err_msg: "Failed to create product" });
            } else {
              // send a 200 response for successful creation
              res
                .status(200)
                .json({ success_msg: "Product successfully created" });
            }
          })
          .catch((err) => {
            // an error got caught log it
            console.error("Error :", err);
            // send a 500 response
            res.status(500).json({ err_msg: "Internal server error" });
          });
      }
    })
    .catch((err) => {
      res.status(400).json({ err_msg: err.message });
    });
});

router.put("/product", async (req, res) => {
  try {
    // get the following data from request body
    const { id, name, description, price, stockQty, categoryId } = req.body;
    // check if the data exists
    if (!id || !name || !description || !price || !stockQty || !categoryId) {
      // send a 400 response for missing data
      res.status(400).json({
        err_msg:
          "id, name, description, price, stock quantity or catogory id is missing or incorrect!",
      });
      return;
    }

    // getting results with concurrent request
    const results = await Promise.all([
      productModel.getProductById(id),
      categoryModel.getCategoryById(categoryId),
    ]);

    // check if product and its updating category exists
    if (results[0].length < 1) {
      res.status(400).json({ err_msg: `Product Id does not exist!` });
      return;
    }
    if (results[1].length < 1) {
      res.status(400).json({ err_msg: `Category Id does not exist!` });
      return;
    }

    // checks all passed, update the product
    productModel
      .updateProduct(id, name, description, price, stockQty, categoryId)
      .then((data) => {
        // check if data got updated
        if (!data) {
          // send a 400 response for update failure
          res
            .status(400)
            .json({ err_msg: `Failed to update product with ID ${id}` });
        } else {
          // send a 200 response for successful update
          res.status(200).json({ success_msg: "Product successfully updated" });
        }
      })
      .catch((err) => {
        // error got caught throw it
        throw err;
      });
  } catch (err) {
    // an error got caught log it
    console.error("Error :", err);
    // send a 500 response
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.delete("/product", (req, res) => {
  // get id from request body
  const { id } = req.body;

  // check if id exists
  if (!id) {
    // send a 400 response for missing id
    res.status(400).json({ err_msg: "id is invalid" });
    return;
  }

  productModel
    .deleteProduct(id)
    .then((result) => {
      // check if deletion failed
      if (!result) {
        // send a 400 response for fail deletion
        res
          .status(400)
          .json({ err_msg: `Failed to Delete product with ID ${id}` });
      }
      // send a 200 response for successful deletion
      res.status(200).json({ success_msg: "Product successfully deleted" });
    })
    .catch((err) => {
      // an error got caught log it
      console.error("Error :", err);
      // send a 500 response
      res.status(500).json({ err_msg: "Internal server error" });
    });
});

// TODO: A lot of validation...
router.put("/product/:id/upload", upload.single("file"), (req, res) => {
  try {
    // check if file and id exists
    if (!req.file || !req.params.id) {
      // send a 406 for missing data
      res.status(406).json({ err_msg: `No file or id found` });
      return;
    }
    const { id } = req.params;
    console.log(req.file);

    // split file name to get file extension
    const fileExt = req.file.originalname.split(".").pop().replace(/ /g, "");

    console.log("checking file");

    // check if file type is valid
    if (!["png", "jpg", "jpeg", "PNG"].includes(fileExt)) {
      // send a 415 response for invalid file
      res.status(415).send();
      return;
    }

    // create new filepath
    const filepath = `./uploads/productImages/${uuidv4()}.${fileExt}`;

    // write the file into disk
    fs.writeFile(filepath, req.file.buffer, (err) => {
      // check if there is an error
      if (err) {
        // throw error
        throw error;
      }
    });

    // file writing complete now update the database
    productModel
      .updateProductImage(id, filepath)
      .then((result) => {
        // check if update failed
        if (!result) {
          // send a 500 response for failed upload
          res.status(500).json({ err_msg: `Image upload failed` });
          return;
        }
        // send a 200 response
        res.status(200).json({ success_msg: `Image upload success` });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    // an error got caught log it
    console.error(err);
    // send a 500 response
    res.status(500).json({ err_msg: `Internal server error` });
  }
});

module.exports = router;
