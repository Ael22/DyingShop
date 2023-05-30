// import database pool
const pool = require("../database");

const category = {
  /**
   * Function to get all the categories in the database
   * @returns An array of categories
   */
  async getAllCategories() {
    try {
      // sends a query to the database
      const result = await pool.query(`SELECT * FROM categories`, []);
      console.log("Query Executed");
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
   * Function to get a category by searching with an id in the database
   * @param {Number} id Category's Id
   * @returns {Array} An array of categories
   */
  async getCategoryById(id) {
    try {
      // sends a query to the database
      const result = await pool.query(`SELECT * FROM categories WHERE id = ?`, [
        id,
      ]);
      console.log("Query Executed");
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
   * Function to create a new category in the database
   * @param {String} name Category's name
   * @param {String} desc Category's description
   * @returns {Boolean} A boolean based on query result
   */
  async createCategory(name, desc) {
    try {
      // sends a query to the database
      await pool.query(
        `INSERT INTO categories (name, description) VALUES (?, ?)`,
        [name, desc]
      );
      console.log("Data Insertion Success!");
      // returns true if there are no errors
      return true;
    } catch (err) {
      // An error got caught log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  /**
   * Function to update a category in the database
   * @param {Number} id Category's Id
   * @param {String} name Category's name
   * @param {String} desc Category's description
   * @returns {Boolean} A boolean based on query result
   */
  async updateCategory(id, name, desc) {
    try {
      // sends a query to the database
      const result = await pool.query(
        `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
        [name, desc, id]
      );
      console.log("Query Executed!");
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
   * Function to delete a category in the database
   * @param {Number} id Category's Id
   * @returns {Boolean} A boolean based on query result
   */
  async deleteCategory(id) {
    try {
      // sends a query to the database
      const result = await pool.query(`DELETE FROM categories WHERE id = ?`, [
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
};

module.exports = category;
