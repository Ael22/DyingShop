// import database pool
const pool = require("../database");

const order = {
  async createOrder(stripeId, checkoutItems, customerId, createdAt) {
    try {
      await pool.query(
        `INSERT INTO orders (stripe_id, checkout_items, customer_id, created_at) VALUES (?, ?, ?, ?)`,
        [stripeId, checkoutItems, customerId, createdAt]
      );

      return true;
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  async getOrdersByCustomerId(customerId) {
    try {
      const result = await pool.query(
        `SELECT stripe_id, checkout_items, created_at  FROM orders WHERE customer_id = ?`,
        [customerId]
      );

      // returns the results
      return result[0];
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },
};

module.exports = order;
