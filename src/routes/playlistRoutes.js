const express = require('express');
const { protect, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  createPlaylist,
  getAllPlaylists,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongsToPlaylist,
  removeFromPlaylist,
  addCollaborator,
  removeCollaborator,
  getFeaturedPlaylists,
} = require('../controllers/playlistController');
const {
  createPlaylistValidator,
  getPlaylistValidator,
  updatePlaylistValidator,
  deletePlaylistValidator,
  addToPlaylistValidator,
  removeFromPlaylistValidator,
  playlistCollaboratorValidator,
} = require('../middlewares/validators/playlistValidator');

const playlistRouter = express.Router();

// Public Routes
playlistRouter.get('/', getAllPlaylists);
playlistRouter.get('/featured', getFeaturedPlaylists);
playlistRouter.get('/:id', getPlaylistValidator, getPlaylistById);

// ProtectedRoutes
playlistRouter.use(protect);
playlistRouter.post(
  '/',
  upload.single('coverImage'),
  createPlaylistValidator,
  createPlaylist,
);

playlistRouter.get('/user/me', getUserPlaylists);
playlistRouter.put(
  '/:id',
  upload.single('coverImage'),
  updatePlaylistValidator,
  updatePlaylist,
);
playlistRouter.delete('/:id', deletePlaylistValidator, deletePlaylist);
playlistRouter.put(
  '/:id/add-songs',
  addToPlaylistValidator,
  addSongsToPlaylist,
);
playlistRouter.put(
  '/:id/remove-songs/:songId',
  removeFromPlaylistValidator,
  removeFromPlaylist,
);
playlistRouter.put(
  '/:id/add-collaborator',
  playlistCollaboratorValidator,
  addCollaborator,
);
playlistRouter.put(
  '/:id/remove-collaborator',
  playlistCollaboratorValidator,
  removeCollaborator,
);
module.exports = playlistRouter;
