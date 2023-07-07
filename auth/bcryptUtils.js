const bcrypt = require("bcrypt");

const saltRounds = 12;

const bcryptUtils = {
  /**
   * Hashes password with bcrypt
   * @param { String } password
   * @returns Password Hash
   */
  async hashPassword(password) {
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .catch((error) => {
        throw error;
      });
  },

  /**
   * Compares password and hash
   * @param {String} password
   * @param {String} hash
   * @returns { Boolean } Result of comparision
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash).catch((error) => {
      throw error;
    });
  },
};

module.exports = bcryptUtils;
