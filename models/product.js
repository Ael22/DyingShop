// Importing libaries and database pool
const cloudinary = require("../config/cloudinary");

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

  async getProductByCategoryId(id) {
    try {
      // sends a query to the database
      const result = await pool.query(
        `SELECT * FROM products WHERE category_id = ?`,
        [id]
      );
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

  async getMostSoldProduct() {
    try {
      const result = await pool.query(
        `SELECT id, sold FROM products order BY sold DESC`,
        []
      );
      console.log("Query executed ");
      return result[0][0];
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  async getMostSoldCategory() {
    try {
      const result = await pool.query(
        `SELECT category_id, SUM(sold) AS "sold" FROM products GROUP BY category_id ORDER BY SUM(sold) DESC`,
        []
      );
      console.log("Query executed ");
      return result[0][0];
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

      if (
        previousUrl !==
        "https://res.cloudinary.com/daegxvwnd/image/upload/v1688811669/products/default_oesd1j.png"
      ) {
        const previousPublicId = previousUrl
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        cloudinary.api
          .delete_resources([previousPublicId], {
            type: "upload",
            resource_type: "image",
          })
          .then(console.log);
      }

      const result = await pool.query(
        `UPDATE products SET image_url = ? WHERE id = ?`,
        [filePath, id]
      );

      console.log("Query executed");

      // Checks if any row got updated
      if (result[0].affectedRows < 1) {
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
        `UPDATE products SET stock_qty = stock_qty - ?, sold = sold + ?  WHERE id = ?`,
        [qty, qty, id]
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
