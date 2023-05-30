const express = require("express");

const categoryModel = require("../../models/category");
const verifyToken = require("../../auth/verifyToken");

const router = express.Router();

router.use("/category", verifyToken);

router.post("/category", (req, res) => {
  try {
    // get name and description from request body
    const { name, description } = req.body;

    // check if name and description exists
    if (!name || !description) {
      // send a 400 response for missing data
      res.status(400).json({ err_msg: "name or description is missing!" });
      return;
    }

    // create the new category
    categoryModel.createCategory(name, description).then((result) => {
      if (!result) {
        // send 500 response error if category fail to create
        res.status(500).json({ err_msg: "Failed to create category" });
      } else {
        // send creation success response
        res.status(201).json({ success_msg: `New category created` });
      }
    });
  } catch (err) {
    // send a 500 response
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.put("/category", (req, res) => {
  try {
    // get id, name and description from request body
    const { id, name, description } = req.body;

    // check if id, name and description exists
    if (!id || !name || !description) {
      // send a 400 response for missing data
      res.status(400).json({ err_msg: "id, name or description is missing!" });
      return;
    }

    // update the category
    categoryModel.updateCategory(id, name, description).then((result) => {
      // check if result update failed
      if (!result) {
        // send 400 response for failed database update
        res
          .status(400)
          .json({ err_msg: `Failed to update category with ID ${id}` });
      } else {
        // send 200 response for successful update
        res.status(200).json({
          success_msg: `Successful Category Update`,
        });
      }
    });
  } catch (err) {
    // Error got caught log it
    console.error("Error ", err);
    // send 500 error
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.delete("/category", (req, res) => {
  try {
    // get id from request body
    const { id } = req.body;

    // check if id exists
    if (!id) {
      // send a 400 response for missing data
      res.status(400).json({ err_msg: "id is missing!" });
      return;
    }

    // delete the category
    categoryModel.deleteCategory(id).then((result) => {
      // check if deletion failed
      if (!result) {
        // send a 500 response for failed deletion
        res.status(500).json({ err_msg: "Failed to delete category" });
      } else {
        // send a 200 response for successful deletion
        res.status(200).json({ success_msg: "Category successfully deleted" });
      }
    });
  } catch (err) {
    // send 500 error
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
