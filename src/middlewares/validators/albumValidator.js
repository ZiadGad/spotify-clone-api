const { body, check } = require('express-validator');
const validatorMiddleware = require('./validatorMiddleware');

const createAlbumValidator = [
  body('title')
    .notEmpty()
    .withMessage('Album must have a title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Description must be between 10 and 200 characters'),
  body('artistId')
    .notEmpty()
    .withMessage('Album must have an artist')
    .isMongoId()
    .withMessage('Artist must be a valid id'),
  validatorMiddleware,
];

const getAllAlbumsValidator = [
  check('artist')
    .optional()
    .isMongoId()
    .withMessage('artist must be a valid id'),
  validatorMiddleware,
];

const getAlbumValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const updateAlbumValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const deleteAlbumValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

module.exports = {
  createAlbumValidator,
  getAllAlbumsValidator,
  getAlbumValidator,
  updateAlbumValidator,
  deleteAlbumValidator,
};
