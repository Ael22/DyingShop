const pool = require("../database");

const customer = {
  async getAllCustomers() {
    try {
      const result = await pool.query(
        `SELECT id, first_name, last_name, email, created_at FROM customers`
      );
      return result[0];
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },
};

module.exports = customer;
