// importing required libraries
const jwt = require("jsonwebtoken");

/**
 * Middleware that verifies the user's JWT token and check if they are an admin
 * @param {*} req request
 * @param {*} res response
 * @param {*} next function
 * @returns 4xx response if token is not verified, otherwise go to the next function
 */
// eslint-disable-next-line consistent-return
const verifyToken = function (req, res, next) {
  // Checks if cookie exists
  if (!req.headers.cookie) {
    // cookie does not exist so send user a 403 response
    return res.status(403).send("Cookie does not exist!");
  }

  // Retrieve JWT token from cookies
  const token = req.headers.cookie.replace("token=", "");

  // Checks if JWT token exists
  if (!token) {
    // JWT Token does not exist so send user a 403 response
    return res.status(403).send("Token does not exist!");
  }

  // JWT token exists, so verify it
  // eslint-disable-next-line consistent-return
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    // if theres an error verifying the token
    if (err) {
      // log the error and send user a 403 response
      console.log(err);
      return res.status(403).send("Unable to Verify User!");
    }
    // check if the decoded token contains admin authentication
    if (!decoded.adminAuth) {
      // token does not contain admin authentication so send a 401 response
      return res.status(401).send("Access Forbidden!");
    }
    // Token passed all checks so move on to the next function
    next();
  });
};

module.exports = verifyToken;
