const jwt = require("jsonwebtoken");
const pool = require("../database");

const Admin = {
  async createAdmin(username, password, callback) {
    try {
      const result = await pool.query(
        `INSERT INTO admins (username, password) VALUES (?, ?)`,
        [username, password]
      );

      console.log("Data insertion success!");
      return callback(null, result);
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },

  async loginAdmin(username, password, callback) {
    try {
      const result = await pool.query(
        `SELECT * FROM admins WHERE username = ? AND password = ?`,
        [username, password]
      );
      if (result[0].length > 0) {
        console.log("Admin Login Success!");
        const token = jwt.sign(
          {
            id: result[0][0].id,
            username: result[0][0].username,
            adminAuth: true,
          },
          process.env.JWT_SECRET,
          { expiresIn: 86400 }
        );
        return callback(null, token);
      }
      console.log("Invalid Username or Password");
      return callback(null, null);
    } catch (err) {
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },

  // TODO: Delete/Update Admin (ONLY IF product and category management is done and have time to do Admin/User Management)
};

module.exports = Admin;
