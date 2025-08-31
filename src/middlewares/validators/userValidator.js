const { body, check } = require('express-validator');
const validatorMiddleware = require('./validatorMiddleware');

exports.registerValidator = [
  body('name').notEmpty().withMessage('Please enter your name'),
  body('email')
    .notEmpty()
    .withMessage('Please enter your email.')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Please enter you password')
    .isLength({ min: 10 })
    .withMessage('Password can not be less than 10 characters'),
  validatorMiddleware,
];

exports.loginValidator = [
  body('email')
    .notEmpty()
    .withMessage('Please enter your email.')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Please enter you password'),
  validatorMiddleware,
];
