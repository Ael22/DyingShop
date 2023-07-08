const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "daegxvwnd",
  api_key: "292128169833753",
  api_secret: process.env.CLOUDINARY_SECRET,
});

module.exports = cloudinary;
