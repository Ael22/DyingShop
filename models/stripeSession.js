// import database pool
const pool = require("../database");

const stripeSesssion = {
  /**
   * Function to insert a stripe session record in the database
   * @param {String} sessionId Stripe checkout session's id
   * @param {JSON} cartItems Cart Items
   * @returns {Boolean} A boolean based on query result
   */
  async createSession(sessionId, cartItems, customerId) {
    try {
      // sends a query to the database
      await pool.query(
        `INSERT INTO stripe_sessions (session_id, checkout_items, customer_id) VALUES (?, ?, ?)`,
        [sessionId, cartItems, customerId]
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
   * Function to get the cart items by its stripe session id
   * @param {String} sessionId Stripe checkout session id
   * @returns {JSON} A cart Items object
   */
  async getCartItemsBySessionID(sessionId) {
    try {
      // sends a query to the database
      const result = await pool.query(
        `SELECT checkout_items, customer_id  FROM stripe_sessions WHERE session_id = ?`,
        [sessionId]
      );
      // returns the results
      return result[0][0];
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },

  /**
   * Function to delete a stripe session record in the database
   * @param {String} sessionId
   * @returns {Boolean} A boolean based on query result
   */
  async deleteSessionBySessionID(sessionId) {
    try {
      // sends a query to the database
      const result = await pool.query(
        `DELETE FROM stripe_sessions WHERE session_id = ?`,
        [sessionId]
      );
      console.log("Query Executed");
      // Checks if any row got deleted
      if (result[0].affectedRows < 1) {
        // return false as no rows got deleted
        return false;
      }
      // Passed all checks so return true
      return true;
    } catch (err) {
      // An error got caught, log it
      console.error("Error executing the SQL Statement: ", err);
      // Throw error to be caught
      throw err;
    }
  },
};

module.exports = stripeSesssion;
