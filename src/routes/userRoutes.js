const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleLikeSong,
  toggleFollowArtist,
  toggleFollowPlaylist,
} = require('../controllers/userController');
const {
  registerValidator,
  loginValidator,
} = require('../middlewares/validators/userValidator');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const userRouter = express.Router();

// Public Routes
userRouter.post('/register', registerValidator, registerUser);
userRouter.post('/login', loginValidator, loginUser);

// Private Routes
userRouter.use(protect);
userRouter
  .route('/profile')
  .get(getUserProfile)
  .put(upload.single('profilePicture'), updateUserProfile);

userRouter.put('/like-song/:id', toggleLikeSong);
userRouter.put('/follow-artist/:id', toggleFollowArtist);
userRouter.put('/follow-playlist/:id', toggleFollowPlaylist);

module.exports = userRouter;
