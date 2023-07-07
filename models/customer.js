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
};

module.exports = customer;
