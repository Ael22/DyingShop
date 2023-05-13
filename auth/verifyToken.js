const jwt = require("jsonwebtoken");

const verifyToken = async function (req, res, next) {
  if (!req.headers.cookie) {
    return res.status(403).send("Cookie does not exist!");
  }
  let token = req.headers.cookie.replace("token=", "");
  if (!token) {
    return res.status(403).send("Token does not exist!");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        console.log(err);
        return res.status(403).send("Unable to Verify User!");
      } else if (!decoded.adminAuth) {
        return res.status(401).send("Access Forbidden!");
      } else {
        next();
      }
    });
  }
};

module.exports = verifyToken;
