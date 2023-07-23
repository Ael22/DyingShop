const jwt = require("jsonwebtoken");
const pool = require("../database");
const bcryptUtils = require("../auth/bcryptUtils");

const customer = {
  async getAllCustomers() {
    try {
      const result = await pool.query(
        `SELECT id, first_name, last_name, email, created_at FROM customers`,
        []
      );
      return result[0];
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  async getCustomerById(id) {
    try {
      const result = await pool.query(
        `SELECT first_name, last_name, email, created_at, verified FROM customers WHERE id = ?`,
        [id]
      );
      return result[0][0];
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  async createCustomer(firstName, lastName, email, password) {
    try {
      const hash = await bcryptUtils.hashPassword(password);
      await pool.query(
        `INSERT INTO customers (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`,
        [firstName, lastName, email, hash]
      );
      console.log("Data Insertion Success!");
      // returns true if there are no errors
      return true;
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  async loginCustomer(email, password) {
    try {
      // sends a query to the database and get results

      const result = await pool.query(
        `SELECT id, password FROM customers WHERE email = ?`,
        [email]
      );

      if (result[0].length < 1) {
        throw new Error("Invalid Email or Password");
      }
      const { id } = result[0][0];
      const hash = result[0][0].password;
      if (!hash) {
        throw new Error("Invalid Email or Password");
      }
      const check = await bcryptUtils.comparePassword(password, hash);
      if (!check) {
        throw new Error("Invalid Email or Password");
      }

      const token = jwt.sign({ id, adminAuth: false }, process.env.JWT_SECRET, {
        expiresIn: 86400,
      });

      return token;
    } catch (err) {
      // An error got caught, log it
      console.error(err);
      // Throw error to be caught
      throw err;
    }
  },

  async updateCustomer(firstName, lastName, email, password, newPassword, id) {
    try {
      const result = await pool.query(
        `SELECT password FROM customers WHERE id = ?`,
        [id]
      );

      if (result[0].length < 1) {
        throw new Error("Invalid Email or Password");
      }

      const hash = result[0][0].password;

      const check = await bcryptUtils.comparePassword(password, hash);

      if (!check) {
        throw new Error("Invalid Password");
      }

      const newHash = await bcryptUtils.hashPassword(newPassword);

      const updateResult = await pool.query(
        `UPDATE customers SET first_name = ?, last_name = ?, email = ?, password = ? WHERE id = ?`,
        [firstName, lastName, email, newHash, id]
      );

      if (updateResult[0].affectedRows < 1) {
        // return false if no rows got updated
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async deleteCustomer(id) {
    try {
      // sends a query to the database
      const result = await pool.query(`DELETE FROM customers WHERE id = ?`, [
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

  async checkEmailVerification(id) {
    try {
      const result = await pool.query(
        "SELECT verified FROM customers WHERE id = ?",
        [id]
      );

      return result[0].verified;
    } catch (err) {
      // An error got caught log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  async updateVerifyToken(id) {
    try {
      const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: 86400,
      });

      // sends a query to the database
      const result = await pool.query(
        `UPDATE customers SET verify_token = ? WHERE id = ?`,
        [token, id]
      );
      console.log("Query Executed");
      // Checks if any row got deleted
      if (result.affectedRows < 1) {
        // return false if no rows got deleted
        return false;
      }
      // Passed all checks so return true
      return token;
    } catch (err) {
      // An error got caught log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  async verifyEmail(token, id) {
    try {
      const result = await pool.query(
        `UPDATE customers SET verified = ?, verify_token = ? WHERE verify_token = ? AND id = ? `,
        [1, null, token, id]
      );
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

module.exports = customer;
