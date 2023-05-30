// Importing libaries and database pool
const fs = require("fs").promises;

const pool = require("../database");

const product = {
  /**
   * Function to get all products in the database
   * @returns {Array} An array of products
   */
  async getAllProducts() {
    try {
      // sends a query to the database
      const result = await pool.query(`SELECT * FROM products`, []);
      console.log("Query executed ");
      // returns the results from the query
      return result[0];
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  /**
   * Function to get a product by searching with an id in the database
   * @param {Number} id Product's id
   * @returns {Array} An array of products
   */
  async getProductById(id) {
    try {
      // sends a query to the database
      const result = await pool.query(`SELECT * FROM products WHERE id = ?`, [
        id,
      ]);
      console.log("Query executed ");
      // returns the results from the query
      return result[0];
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  /**
   * Function to create a new product in the database
   * @param {String} name Product's name
   * @param {String} description Product's description
   * @param {Number} price Product's price
   * @param {Number} stockQty Product's stock quantity
   * @param {Number} categoryId Product's Category Id
   * @returns {Boolean} A boolean based on query result
   */
  async createNewProduct(name, description, price, stockQty, categoryId) {
    try {
      // sends a query to the database
      await pool.query(
        `INSERT INTO products (name, description, price, stock_qty, category_id) VALUES (?, ?, ?, ?, ?)`,
        [name, description, price, stockQty, categoryId]
      );
      // returns true if there are no errors
      return true;
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  /**
   * Function to update a Product in the database
   * @param {Number} id Product's Id
   * @param {String} name Product's name
   * @param {String} description Product's description
   * @param {Number} price Product's price
   * @param {Number} stockQty Product's stock quantity
   * @param {Number} categoryId Product's Category Id
   * @returns {Boolean} A boolean based on query result
   */
  async updateProduct(id, name, description, price, stockQty, categoryId) {
    try {
      // sends a query to the database
      const result = await pool.query(
        `UPDATE products SET name = ?, description = ?, price = ?, stock_qty = ?, category_id = ? WHERE id = ?`,
        [name, description, price, stockQty, categoryId, id]
      );
      // Checks if any row got updated
      if (result[0].affectedRows < 1) {
        // return false if no rows got updated
        return false;
      }
      // Passed all checks so return true
      return true;
    } catch (err) {
      // An error got caught log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  /**
   * Function to delete a product in the database
   * @param {Number} id Product's Id
   * @returns {Boolean} A boolean based on query result
   */
  async deleteProduct(id) {
    try {
      // sends a query to the database
      const result = await pool.query(`DELETE FROM products WHERE id = ?`, [
        id,
      ]);
      console.log("Query Executed");
      // Checks if any row got deleted
      if (result[0].affectedRows < 1) {
        // return false if no rows got deleted
        return false;
      }
      // Passed all checks so return true
      return true;
    } catch (err) {
      // An error got caught log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  /**
   * Function to update a product's uploaded image path in the database
   * @param {Number} id Product's id
   * @param {String} filePath Path of the uploaded file
   * @returns {Boolean} A boolean based on query result
   */
  async updateProductImage(id, filePath) {
    try {
      // sends a query to the database to get currently stored path
      const previousUrlResult = await pool.query(
        `SELECT image_url FROM products WHERE id = ?`,
        [id]
      );
      const previousUrl = previousUrlResult[0][0].image_url;

      // Checks if current stored path is using using default image
      if (previousUrl !== `/uploads/productImages/default.png`) {
        // Current stored path is using default image so we delete the stored image on the disk
        await fs.unlink(`${process.cwd() + previousUrl}`);
        console.log("File deleted");
        // returm false as no update is ran
        return false;
      }

      // sends a query to the database to update image path to new path
      const updateResult = await pool.query(
        `UPDATE products SET image_url = ? WHERE id = ?`,
        [filePath.slice(1), id]
      );
      console.log("Query executed");

      // Checks if any row got updated
      if (updateResult[0].affectedRows < 1) {
        // return false as no rows got deleted
        return false;
      }
      // Passed all checks so return true
      return true;
    } catch (err) {
      // An error got caught log it
      console.error("Error", err);
      // Throw error to be caught
      throw err;
    }
  },

  /**
   * Function to update a product's stock in the database
   * @param {Number} id Product's Id
   * @param {Number} qty Amount of product quantity to substract
   * @returns A boolean based on query result
   */
  async updateProductStock(id, qty) {
    try {
      // sends a query to the database
      const result = await pool.query(
        `UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?`,
        [qty, id]
      );
      // Checks if any row got deleted
      if (result[0].affectedRows < 1) {
        // return false as no rows got deleted
        return false;
      }
      // Passed all checks so return true
      return true;
    } catch (err) {
      // An error got caught log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },
};

module.exports = product;
