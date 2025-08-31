// TODO: Create add/remove songs to/from album route

const express = require('express');
const { protect, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  createAlbum,
  getAlbums,
  getAlbum,
  updateAlbum,
  deleteAlbum,
  addSongsToAlbum,
  removeSongFromAlbum,
  getNewReleases,
} = require('../controllers/albumController');
const {
  createAlbumValidator,
  getAllAlbumsValidator,
  getAlbumValidator,
  updateAlbumValidator,
  deleteAlbumValidator,
} = require('../middlewares/validators/albumValidator');
const albumRouter = express.Router();

// Public Routes
albumRouter.get('/', getAllAlbumsValidator, getAlbums);
albumRouter.get('/new-releases', getNewReleases);
albumRouter.get('/:id', getAlbumValidator, getAlbum);

// Private Routes
albumRouter.use(protect, isAdmin);
albumRouter.post(
  '/',
  upload.single('coverImage'),
  createAlbumValidator,
  createAlbum,
);
albumRouter
  .route('/:id')
  .put(upload.single('coverImage'), updateAlbumValidator, updateAlbum)
  .delete(deleteAlbumValidator, deleteAlbum);

albumRouter.post('/:id/add-songs', addSongsToAlbum);
albumRouter.delete('/:id/remove-songs/:songId', removeSongFromAlbum);
module.exports = albumRouter;
