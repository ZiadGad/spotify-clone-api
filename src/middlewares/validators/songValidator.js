const { check, body } = require('express-validator');
const validatorMiddleware = require('./validatorMiddleware');

const createSongValidator = [
  body('title').notEmpty().withMessage('Song must have a title'),
  body('artist')
    .notEmpty()
    .withMessage('Song must belong to an artist')
    .isMongoId()
    .withMessage('invalid mongo id'),
  body('duration').notEmpty().withMessage('Song must have a duration'),

  validatorMiddleware,
];

const getSongValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const updateSongValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const deleteSongValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

module.exports = {
  createSongValidator,
  getSongValidator,
  updateSongValidator,
  deleteSongValidator,
};
