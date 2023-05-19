const fs = require("fs").promises;

const pool = require("../database");
const product = {
  async getAllProducts() {
    try {
      const result = await pool.query(`SELECT * FROM products`, []);
      console.log("Query executed ");
      return result[0];
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async getProductById(id) {
    try {
      const result = await pool.query(`SELECT * FROM products WHERE id = ?`, [
        id,
      ]);
      console.log("Query executed ");
      return result[0];
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async createNewProduct(name, description, price, stockQty, categoryId) {
    try {
      const result = await pool.query(
        `INSERT INTO products (name, description, price, stock_qty, category_id) VALUES (?, ?, ?, ?, ?)`,
        [name, description, price, stockQty, categoryId]
      );
      if (result[0].affectedRows < 1) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async updateProduct(id, name, description, price, stockQty, categoryId) {
    try {
      const result = await pool.query(
        `UPDATE products SET name = ?, description = ?, price = ?, stock_qty = ?, category_id = ? WHERE id = ?`,
        [name, description, price, stockQty, categoryId, id]
      );
      if (result[0].affectedRows < 1) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async deleteProduct(id) {
    try {
      const result = await pool.query(`DELETE FROM products WHERE id = ?`, [
        id,
      ]);
      console.log("Query Executed");
      if (result[0].affectedRows < 1) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async updateProductImage(id, filePath) {
    try {
      const previousUrlResult = await pool.query(
        `SELECT image_url FROM products WHERE id = ?`,
        [id]
      );
      const previousUrl = previousUrlResult[0][0].image_url;

      if (previousUrl !== `/uploads/productImages/default.png`) {
        await fs.unlink(`${process.cwd() + previousUrl}`);
        console.log("File deleted");
      }

      const updateResult = await pool.query(
        `UPDATE products SET image_url = ? WHERE id = ?`,
        [filePath.slice(1), id]
      );
      console.log("Query executed");

      if (updateResult[0].affectedRows < 1) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error", err);
      throw err;
    }
  },
};

module.exports = product;
