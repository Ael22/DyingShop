const pool = require("../database");

const category = {
  async getAllCategories(callback) {
    try {
      const result = await pool.query(`SELECT * FROM categories`, []);
      console.log("Query Executed");
      return callback(null, result[0]);
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },

  async getCategoryById(id, callback) {
    try {
      const result = await pool.query(`SELECT * FROM categories WHERE id = ?`, [
        id,
      ]);
      console.log("Query Executed");
      return callback(null, result[0]);
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },

  async createCategory(name, desc, callback) {
    try {
      const result = await pool.query(
        `INSERT INTO categories (name, description) VALUES (?, ?)`,
        [name, desc]
      );
      console.log(
        "Data Insertion Success! Affected Rows: ",
        result[0].affectedRows
      );
      return callback(null, result[0]);
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },

  async updateCategory(id, name, desc, callback) {
    try {
      const result = await pool.query(
        `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
        [name, desc, id]
      );
      console.log("Query Executed!");
      return callback(null, result[0]);
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },

  async deleteCategory(id, callback) {
    try {
      const result = await pool.query(`DELETE FROM categories WHERE id = ?`, [
        id,
      ]);
      console.log("Query Executed");
      return callback(null, result[0]);
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },
};

module.exports = category;
