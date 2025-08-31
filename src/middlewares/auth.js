const { promisify } = require('util');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  // TODO: check if user changed his password
  req.user = user;
  next();
});

const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin)
    return next(
      new AppError('You are not authorized to perform this action', 401),
    );
  next();
};
module.exports = { protect, isAdmin };
