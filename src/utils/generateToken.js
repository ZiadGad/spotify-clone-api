const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return (token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP_IN,
  }));
};

module.exports = generateToken;
