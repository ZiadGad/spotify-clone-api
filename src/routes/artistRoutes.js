const express = require('express');
const {
  createArtistValidator,
  getArtistValidator,
  updateArtistValidator,
  deleteArtistValidator,
} = require('../middlewares/validators/artistValidator');
const {
  createArtist,
  getArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  getTopArtists,
  getArtistTopSongs,
} = require('../controllers/artistController');
const { protect, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const artistRouter = express.Router();

// Public Routes
artistRouter.get('/', getArtists);
artistRouter.get('/top', getTopArtists);
artistRouter.get('/:id/top-songs', getArtistValidator, getArtistTopSongs);
artistRouter.get('/:id', getArtistValidator, getArtistById);

// Admin Routes
artistRouter.use(protect, isAdmin);
artistRouter.post(
  '/',
  upload.single('image'),
  createArtistValidator,
  createArtist,
);

artistRouter
  .route('/:id')
  .put(upload.single('image'), updateArtistValidator, updateArtist)
  .delete(deleteArtistValidator, deleteArtist);

module.exports = artistRouter;
