// importing required libraries and database pool
const jwt = require("jsonwebtoken");
const pool = require("../database");

const Admin = {
  /**
   * Function to creates a new admin on the database
   * @param {String} username Admin's username
   * @param {String} password Admin's password
   * @param {Function} callback callback function
   * @returns {Function} callback function
   */
  // Function not used yet so no documentation on the function
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

  /**
   * Function to Get a user using username and password to see if they are on the database. If user is not found it will return an error in the callback
   * @param {String} username Admin's username
   * @param {String} password Admin's password
   * @param {Function} callback callback function
   * @returns {Function} callback function
   */
  async loginAdmin(username, password, callback) {
    try {
      // sends a query to the database and get results
      const result = await pool.query(
        `SELECT * FROM admins WHERE username = ? AND password = ?`,
        [username, password]
      );
      // Checks if there are any results found
      if (result[0].length > 0) {
        // If there are results found create and sign a jwt token
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
        // return a callback function with the token
        return callback(null, token);
      }
      // if no user is found return a null callback function
      console.log("Invalid Username or Password");
      return callback(null, null);
    } catch (err) {
      // an error got caught, return a error callback function
      console.error("Error executing the SQL Statement: ", err);
      return callback(err, null);
    }
  },

  // TODO: Delete/Update Admin for CA2
};

module.exports = Admin;
