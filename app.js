const express = require("express");
const createHttpError = require("http-errors");
const isInteger = require("is-integer");
const { isDecimal } = require("fix-esm").require("is-decimal");

const adminModel = require("./models/admin");
const categoryModel = require("./models/category");
const productModel = require("./models/product");

// const verifyToken = require("./auth/verifyToken");

const app = express();
app.use(express.json()); // to process JSON in request body

// For development purposes not needed
// app.use("/admin/dashboard", verifyToken);

app.use(express.static("public"));

app.get("/test", (req, res) => res.json({ hello: "world" }));

// Method only for admin to use
// need auth

// app.post("/admin/create", (req, res) => {
//   const { username, password } = req.body;
//   if (username == null || password == null) {
//     res.status(400).json({ err_msg: "username or password is empty" });
//   } else {
//     adminModel.createAdmin(username, password, (err, result) => {
//       if (err) {
//         if (err.code === "ER_DUP_ENTRY") {
//           res.status(400).json({ err_msg: "Username is taken. Try another" });
//         } else {
//           res.status(500).json({ err_msg: "Internal server error" });
//         }
//       } else {
//         res.status(200).json({ success_msg: "Admin Created!" });
//       }
//     });
//   }
// });

app.post("/api/admin/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (username == null || password == null) {
      res.status(400).json({ err_msg: "username or password is empty" });
      return;
    }
    adminModel.loginAdmin(username, password, (err, result) => {
      if (err) {
        res.status(500).json({ err_msg: "Internal server error" });
      } else if (!result) {
        res.status(401).json({ err_msg: "Invalid Username or Password" });
      } else {
        res
          .cookie("token", result, { httpOnly: false })
          .status(200)
          .json({ token: result });
      }
    });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  if (!req.headers.cookie) {
    res.status(406).send("Cookie Missing!");
  } else {
    res.status(200).clearCookie("token").send("Cookie Cleared");
  }
});

app.get("/api/category", (req, res) => {
  try {
    categoryModel.getAllCategories((err, result) => {
      if (err) {
        res.status(500).json({ err_msg: "Internal server error" });
      } else {
        res.status(200).json({ categories: result });
      }
    });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

app.get("/api/category/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!isInteger(parseInt(id, 10))) {
      res.status(400).json({ err_msg: "id cannot be empty!" });
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

// TODO: need to add verifyToken middleware for post,put,delete so only verified admins can use those api
// only for development purposes we dont implement it now

app.post("/api/category", (req, res) => {
  try {
    const { name, description } = req.body;
    if (
      name == null ||
      description == null ||
      name === "" ||
      description === ""
    ) {
      res.status(400).json({ err_msg: "name or description is missing!" });
      return;
    }
    categoryModel.createCategory(name, description, (err, result) => {
      if (err) {
        res.status(500).json({ err_msg: "Internal server error" });
      } else if (result.affectedRows > 0) {
        res.status(201).json({
          success_msg: `Category with ID ${result.insertId} created`,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

app.put("/api/category", (req, res) => {
  try {
    const { id, name, description } = req.body;
    if (
      id == null ||
      description == null ||
      name == null ||
      description === "" ||
      name === ""
    ) {
      res.status(400).json({ err_msg: "id, name or description is missing!" });
      return;
    }
    categoryModel.updateCategory(id, name, description, (err, result) => {
      if (err) {
        res.status(500).json({ err_msg: "Internal server error" });
      } else if (result.affectedRows < 1) {
        res
          .status(400)
          .json({ err_msg: `Failed to Update Category with ID ${id}` });
      } else {
        res.status(200).json({
          success_msg: `Successful Category Update`,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

app.delete("/api/category", (req, res) => {
  try {
    const { id } = req.body;
    categoryModel.deleteCategory(id, (err, result) => {
      if (err) {
        res.status(500).json({ err_msg: "Internal server error" });
      } else if (result.affectedRows < 1) {
        res
          .status(400)
          .json({ err_msg: ` Failed to Delete Category with ID ${id}` });
      } else {
        res.status(200).json({
          success_msg: `Successful Category Deletion`,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

app.get("/api/product", (req, res) => {
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

// TODO: authenticate POST/PUT/DELETE of products

app.post("/api/product", (req, res) => {
  const { name, description, price, stockQty, categoryId } = req.body;
  if (
    name == null ||
    description == null ||
    price == null ||
    stockQty == null ||
    categoryId == null ||
    name === "" ||
    description === "" ||
    price === "" ||
    stockQty === "" ||
    categoryId === "" ||
    isInteger(parseInt(stockQty, 10)) === false ||
    isDecimal(parseFloat(price))
  ) {
    res.status(400).json({
      err_msg:
        "name, description, price, stock quantity or catogory id is missing or incorrect!",
    });
    return;
  }

  categoryModel
    .getCategoryById(categoryId)
    .then((data) => {
      if (data.length < 1) {
        throw new Error(`Category Id ${categoryId} does not exist`);
      } else {
        productModel
          .createNewProduct(name, description, price, stockQty, categoryId)
          .then((result) => {
            if (result.affectedRows < 1) {
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

// TODO: concurrent request for finding category id and product id and complete this whole thing
app.put("/api/product", (req, res) => {
  const { id, name, description, price, stockQty, categoryId } = req.body;
  if (
    name == null ||
    description == null ||
    price == null ||
    stockQty == null ||
    categoryId == null ||
    name === "" ||
    description === "" ||
    price === "" ||
    stockQty === "" ||
    categoryId === "" ||
    isInteger(parseInt(stockQty, 10)) === false ||
    isDecimal(parseFloat(price)) ||
    id == null ||
    id === ""
  ) {
    res.status(400).json({
      err_msg:
        "id, name, description, price, stock quantity or catogory id is missing or incorrect!",
    });
    return;
  }

  categoryModel
    .getCategoryById(categoryId)
    .then((data) => {
      if (data.length < 1) {
        throw new Error(`Category Id ${categoryId} does not exist`);
      } else {
        productModel
          .updateProduct(id, name, description, price, stockQty, categoryId)
          .then((result) => {
            res.status(200).json({ result });
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

app.delete("/api/product", (req, res) => {
  const { id } = req.body;
  if (!isInteger(parseInt(id, 10))) {
    res.status(400).json({ err_msg: "id is invalid" });
    return;
  }
  productModel
    .deleteProduct(id)
    .then((result) => {
      if (result.affectedRows < 1) {
        res
          .status(400)
          .json({ err_msg: ` Failed to Delete product with ID ${id}` });
        return;
      }
      res.status(200).json({ success_msg: "Product successfully deleted" });
    })
    .catch((err) => {
      console.error("Error :", err);
      res.status(500).json({ err_msg: "Internal server error" });
    });
});

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
