// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require("jsonwebtoken");

// eslint-disable-next-line consistent-return
const verifyToken = async function (req, res, next) {
  if (!req.headers.cookie) {
    return res.status(403).send("Cookie does not exist!");
  }
  const token = req.headers.cookie.replace("token=", "");
  if (!token) {
    return res.status(403).send("Token does not exist!");
  }
  // eslint-disable-next-line consistent-return
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      console.log(err);
      return res.status(403).send("Unable to Verify User!");
    }
    if (!decoded.adminAuth) {
      return res.status(401).send("Access Forbidden!");
    }
    next();
  });
};

module.exports = verifyToken;
