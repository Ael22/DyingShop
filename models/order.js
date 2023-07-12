// import database pool
const pool = require("../database");

const order = {
  async createOrder(stripeId, checkoutItems, customerId) {
    try {
      await pool.query(
        `INSERT INTO orders (stripe_id, checkout_items, customer_id) VALUES (?, ?, ?)`,
        [stripeId, checkoutItems, customerId]
      );

      return true;
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },
};

module.exports = order;
