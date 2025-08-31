const express = require('express');
const { protect, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  createSong,
  getAllSongs,
  getSong,
  updateSong,
  deleteSong,
  getTopSongs,
  getNewReleases,
} = require('../controllers/songController');
const {
  createSongValidator,
  getSongValidator,
  updateSongValidator,
  deleteSongValidator,
} = require('../middlewares/validators/songValidator');

const songRouter = express.Router();

// configure multer to handle multiple file types
const songUpload = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

// Public Routes
songRouter.get('/', getAllSongs);
songRouter.get('/top', getTopSongs);
songRouter.get('/new-releases', getNewReleases);
songRouter.get('/:id', getSongValidator, getSong);

// Private Routes
songRouter.use(protect, isAdmin);
songRouter.post('/', songUpload, createSongValidator, createSong);
songRouter
  .route('/:id')
  .put(songUpload, updateSongValidator, updateSong)
  .delete(deleteSongValidator, deleteSong);

module.exports = songRouter;
