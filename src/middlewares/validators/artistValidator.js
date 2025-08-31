const { body, check } = require('express-validator');
const validatorMiddleware = require('./validatorMiddleware');

const createArtistValidator = [
  body('name').notEmpty().withMessage('Artist name is required'),
  body('genres')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Genres must be a non-empty array'),
  validatorMiddleware,
];

const getArtistValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const updateArtistValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const deleteArtistValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

module.exports = {
  createArtistValidator,
  getArtistValidator,
  updateArtistValidator,
  deleteArtistValidator,
};
