const generateToken = require('../generateToken');

exports.sanitizeUser = function (user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    profilePicture: user.profilePicture,
  };
};
exports.sanitizeUserLogin = function (user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    profilePicture: user.profilePicture,
    token: generateToken(user._id),
  };
};
