const pool = require("../database");

const category = {
  async getAllCategories() {
    try {
      const result = await pool.query(`SELECT * FROM categories`, []);
      console.log("Query Executed");
      return result[0];
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },

  async getCategoryById(id) {
    try {
      const result = await pool.query(`SELECT * FROM categories WHERE id = ?`, [
        id,
      ]);
      console.log("Query Executed");
      return result[0];
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async createCategory(name, desc) {
    try {
      const result = await pool.query(
        `INSERT INTO categories (name, description) VALUES (?, ?)`,
        [name, desc]
      );
      console.log("Data Insertion Success!");
      if (result[0].affectedRows < 1) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async updateCategory(id, name, desc) {
    try {
      const result = await pool.query(
        `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
        [name, desc, id]
      );
      console.log("Query Executed!");
      if (result[0].affectedRows < 1) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async deleteCategory(id) {
    try {
      const result = await pool.query(`DELETE FROM categories WHERE id = ?`, [
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
};

module.exports = category;
