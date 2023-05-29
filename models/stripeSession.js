const pool = require("../database");

const stripeSesssion = {
  async createSession(sessionId, cartItems) {
    try {
      await pool.query(
        `INSERT INTO stripe_sessions (session_id, checkout_items) VALUES (?, ?)`,
        [sessionId, cartItems]
      );
      return true;
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async getCartItemsBySessionID(sessionId) {
    try {
      const result = await pool.query(
        `SELECT checkout_items FROM stripe_sessions WHERE session_id = ?`,
        [sessionId]
      );
      return result[0][0];
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      throw err;
    }
  },

  async deleteSessionBySessionID(sessionId) {
    try {
      const result = await pool.query(
        `DELETE FROM stripe_sessions WHERE session_id = ?`,
        [sessionId]
      );
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

module.exports = stripeSesssion;
