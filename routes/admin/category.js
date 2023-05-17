const express = require("express");

const categoryModel = require("../../models/category");
const verifyToken = require("../../auth/verifyToken");

const router = express.Router();

router.use("/category", verifyToken);

router.post("/category", (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      res.status(400).json({ err_msg: "name or description is missing!" });
      return;
    }
    categoryModel.createCategory(name, description).then((result) => {
      if (!result) {
        res.status(500).json({ err_msg: "Failed to create category" });
      } else {
        res.status(201).json({ success_msg: `New category created` });
      }
    });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.put("/category", (req, res) => {
  try {
    const { id, name, description } = req.body;
    if (!id || !name || !description) {
      res.status(400).json({ err_msg: "id, name or description is missing!" });
      return;
    }
    categoryModel.updateCategory(id, name, description).then((result) => {
      if (!result) {
        res
          .status(400)
          .json({ err_msg: `Failed to update category with ID ${id}` });
      } else {
        res.status(200).json({
          success_msg: `Successful Category Update`,
        });
      }
    });
  } catch (err) {
    console.error("Error ", err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.delete("/category", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ err_msg: "id is missing!" });
      return;
    }
    categoryModel.deleteCategory(id).then((result) => {
      if (!result) {
        res.status(500).json({ err_msg: "Failed to delete category" });
      } else {
        res.status(200).json({ success_msg: "Category successfully deleted" });
      }
    });
  } catch (err) {
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
