const { body, check } = require('express-validator');
const validatorMiddleware = require('./validatorMiddleware');

const createPlaylistValidator = [
  body('name')
    .notEmpty()
    .withMessage('Playlist name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Description must be between 10 and 200 characters'),
  validatorMiddleware,
];

const getPlaylistValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const updatePlaylistValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const deletePlaylistValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  validatorMiddleware,
];

const addToPlaylistValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  body('songIds')
    .notEmpty()
    .withMessage('song id is required')
    .isArray({ min: 1 })
    .withMessage('song id must be a non-empty array'),
  validatorMiddleware,
];

const removeFromPlaylistValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  check('songId')
    .notEmpty()
    .withMessage('song id is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),

  validatorMiddleware,
];

const playlistCollaboratorValidator = [
  check('id')
    .notEmpty()
    .withMessage('id param is required')
    .isMongoId()
    .withMessage('Enter a valid mongo id'),
  body('userId').notEmpty().withMessage('userId is required'),
  validatorMiddleware,
];

module.exports = {
  createPlaylistValidator,
  getPlaylistValidator,
  updatePlaylistValidator,
  deletePlaylistValidator,
  addToPlaylistValidator,
  removeFromPlaylistValidator,
  playlistCollaboratorValidator,
};
