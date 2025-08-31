const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Playlist = require('../models/Playlist');
const AppError = require('../utils/AppError');
const {
  sanitizeUser,
  sanitizeUserLogin,
} = require('../utils/sanitizers/userSanitizer');
const { uploadToCloudinary } = require('../utils/cloudinaryUploads');

// @desc - Register a new user
// @route - POST api/v1/users/register
// @Access - Public

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) return next(new AppError('User already exists', 400));

  const user = await User.create({
    name,
    email,
    password,
  });
  res.status(201).json({
    status: 'success',
  });
});

// @desc - Login user
// @route - POST api/v1/users/login
// @Access - Public

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));
  res.status(200).json({
    status: 'success',
    user: sanitizeUserLogin(user),
  });
});

// @desc -  Get Current User Profile
// @route - GET api/v1/users/profile
// @Access - Private

const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('likedSongs', 'title artist duration')
    .populate('likedAlbums', 'title artist coverImage')
    .populate('followedArtists', 'name image')
    .populate('followedPlaylists', 'name creator coverImage');

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc -  Update User Profile
// @route - PUT api/v1/users/profile
// @Access - Private

const updateUserProfile = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError('No data sent', 400));
  }
  const { name, email, password } = req.body;
  const user = await User.findById(req.user._id);
  user.name = name || user.name;
  user.email = email || user.email;
  if (password) {
    user.password = password;
  }
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'spotify/users');
    user.profilePicture = result.secure_url;
  }
  const updatedUser = await user.save();
  res.status(200).json(sanitizeUser(updatedUser));
});

// @desc -  Like/Unlike a song
// @route - PUT api/v1/users/like-song/:id
// @Access - Private

const toggleLikeSong = asyncHandler(async (req, res, next) => {
  const songId = req.params.id;
  const user = await User.findById(req.user._id);

  const song = await Song.findById(songId);
  if (!song) return next(new AppError('song not found', 404));

  // Check if song is already liked
  const songIndex = user.likedSongs.indexOf(songId);
  if (songIndex === -1) {
    user.likedSongs.push(songId);
    song.likes += 1;
  } else {
    // remove song from liked songs
    user.likedSongs.splice(songIndex, 1);
    if (song.likes > 0) {
      song.likes -= 1;
    }
  }
  await Promise.all([user.save(), song.save()]);

  res.status(200).json({
    status: 'success',
    likedSongs: user.likedSongs,
    message:
      songIndex === -1
        ? 'song added to liked songs'
        : 'song removed from liked songs',
  });
});

// @desc -  Follow/Unfollow an artist
// @route - PUT api/v1/users/follow-artist/:id
// @Access - Private

const toggleFollowArtist = asyncHandler(async (req, res, next) => {
  const artistId = req.params.id;
  const user = await User.findById(req.user._id);
  const artist = await Artist.findById(artistId);

  if (!artist) return next(new AppError('artist not found', 404));

  // Check if artist is already followed
  const artistIndex = user.followedArtists.indexOf(artistId);
  if (artistIndex === -1) {
    user.followedArtists.push(artist);
    artist.followers += 1;
  } else {
    // remove song from liked songs
    user.followedArtists.splice(artistIndex, 1);
    if (artist.followers > 0) {
      artist.followers -= 1;
    }
  }
  await Promise.all([user.save(), artist.save()]);

  res.status(200).json({
    status: 'success',
    message: artistIndex === -1 ? 'artist followed' : 'artist unfollowed',
  });
});

//@desc - Follow/unfollow a playlist
//@route - PUT /api/users/follow-playlist/:id
//@Access - Private

const toggleFollowPlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params.id;
  const user = await User.findById(req.user._id);

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) return next(new AppError('playlist not found', 404));

  // Check if playlist is already followed
  const playlistIndx = user.followedPlaylists.indexOf(playlistId);

  if (playlistIndx === -1) {
    user.followedPlaylists.push(playlistId);
    playlist.followers += 1;
  } else {
    user.followedPlaylists.splice(playlistIndx, 1);
    if (playlist.followers > 0) {
      playlist.followers -= 1;
    }
  }
  await Promise.all([user.save(), playlist.save()]);
  res.status(200).json({
    followedPlaylists: user.followedPlaylists,
    message: playlistIndx === -1 ? 'Playlist followed' : 'Playlist unfollowed',
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleLikeSong,
  toggleFollowArtist,
  toggleFollowPlaylist,
};
