const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const { uploadToCloudinary } = require('../utils/cloudinaryUploads');
const ApiFeature = require('../utils/apiFeatures');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const { cleanupFile } = require('../utils/cleanupFile');

// @desc - Create new playlist
// @route - POST api/v1/playlists
// @Access - Private/Admin

const createPlaylist = asyncHandler(async (req, res, next) => {
  const { name, description, isPublic } = req.body;

  //   check if playlist already exist
  const existingPlaylist = await Playlist.findOne({
    name,
    creator: req.user._id,
  });
  if (existingPlaylist) {
    cleanupFile(req.file?.coverImage.path);
    return next(new AppError('Playlist with this name is already exists', 400));
  }

  //   upload playlist cover image if provided
  let coverImageUrl = '';

  if (req.file && req.file.coverImage) {
    const result = await uploadToCloudinary(
      req.file.coverImage.path,
      'spotify/playlists',
    );
    coverImageUrl = result.secure_url;
  }

  //   create the playlist
  const playlist = await Playlist.create({
    name,
    description,
    creator: req.user._id,
    coverImage: coverImageUrl || undefined,
    isPublic: isPublic === 'true',
  });
  res.status(201).json({
    status: 'success',
    data: {
      playlist,
    },
  });
});

// @desc - Get all playlists
// @route - GET api/v1/playlists?search=summar&page=1&limit=10
// @Access - Public/Private

const getAllPlaylists = asyncHandler(async (req, res, next) => {
  const documentsCount = await Playlist.countDocuments();
  const features = new ApiFeature(Playlist.find({ isPublic: true }), req.query)
    .filter()
    .sort()
    .search('playlist')
    .paginate(documentsCount);

  const { query, metadata } = features;
  const playlists = await query
    .populate('creator', 'name profilePicture')
    .populate('collaborators', 'name profilePicture');
  res.status(200).json({
    status: 'success',
    results: playlists.length,
    metadata,
    data: {
      playlists,
    },
  });
});

// @desc - Get users's playlist
// @route - GET api/v1/playlists/user/me
// @Access - Private

const getUserPlaylists = asyncHandler(async (req, res, next) => {
  const playlists = await Playlist.find({
    $or: [{ creator: req.user._id }, { collaborators: req.user._id }],
  })
    .sort('-createdAt')
    .populate('creator', 'name profilePicture');

  res.status(200).json({
    status: 'success',
    data: {
      playlists,
    },
  });
});

// @desc - Get  playlist by id
// @route - POST api/v1/playlists/:id
// @Access - Private/Admin

const getPlaylistById = asyncHandler(async (req, res, next) => {
  const playlist = await Playlist.findById(req.params.id)
    .populate('creator', 'name profilePicture')
    .populate('collaborators', 'name profilePicture');

  if (!playlist)
    return next(new AppError('Playlist with this id does not exists', 404));

  //   Check if the playlist is private and the current user is not the creator or collaborator
  if (
    !playlist.isPublic &&
    !(
      req.user &&
      (playlist.creator.equals(req.user._id) ||
        playlist.collaborators.some((collab) => collab.equals(req.user._id)))
    )
  )
    return next(new AppError('This Playlist is Private', 403));
  res.status(200).json({
    status: 'success',
    data: {
      playlist,
    },
  });
});

// @desc - Update playlist
// @route - PUT api/v1/playlists/:id
// @Access - Private

const updatePlaylist = asyncHandler(async (req, res, next) => {
  const { name, description, isPublic } = req.body;
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return next(new AppError('Play list not found', 404));

  //   Check if current user is creator or collaborator
  if (
    !playlist.creator.equals(req.user._id) &&
    !playlist.collaborators.some((collab) => collab.equals(req.user._id))
  )
    return next(new AppError('Not authorized to update this playlist', 403));

  playlist.name = name || playlist.name;
  playlist.description = description || playlist.description;

  //   Only craetor can change privacy settings
  if (playlist.creator.equals(req.user._id)) {
    playlist.isPublic =
      isPublic !== undefined ? isPublic === 'true' : playlist.isPublic;
  }

  //   Update cover image if provided
  if (req.file && req.file.coverImage) {
    const result = await uploadToCloudinary(
      req.file.coverImage.path,
      'spotify/playlists',
    );
    playlist.coverImage = result.secure_url;
  }

  await playlist.save();
  res.status(200).json({
    status: 'success',
    data: {
      playlist,
    },
  });
});

// @desc - Delete playlist
// @route - DELETE api/v1/playlists/:id
// @Access - Private

const deletePlaylist = asyncHandler(async (req, res, next) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return next(new AppError('playlist not found', 404));

  //   only creator can delete his own playlist
  if (!playlist.creator.equals(req.user._id))
    return next(
      new AppError('You are not authorized to delete this playlist', 403),
    );

  const imgUrl = playlist.coverImage;
  await playlist.deleteOne();
  await removeFromCloudinary(imgUrl);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// @desc - Add song to playlist
// @route - PUT api/v1/playlists/:id/add-songs
// @Access - Private

const addSongsToPlaylist = asyncHandler(async (req, res, next) => {
  const { songIds } = req.body;
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return next(new AppError('playlist not found', 404));

  //   Check if the current user is the creator or collaborator
  if (
    !playlist.creator.equals(req.user._id) &&
    !playlist.collaborators.some((collab) => collab.equals(req.user._id))
  )
    return next(
      new AppError('You are not authorized to modify this playlist', 403),
    );

  // Add songs to playlist
  for (const songId of songIds) {
    const song = await Song.findById(songId);
    if (!song) continue; // Skip if song doesn't exist

    // check if song already in playlist
    if (playlist.songs.includes(songId)) continue;

    playlist.songs.push(songId);
  }
  await playlist.save();
  res.status(200).json({
    status: 'success',
    data: {
      playlist,
    },
  });
});

// @desc - Remove song from playlist
// @route - PUT api/v1/playlists/:id/remove-songs/:songId
// @Access - Private

const removeFromPlaylist = asyncHandler(async (req, res, next) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return next(new AppError('playlist not found', 404));

  //   Check if the current user is the creator or collaborator
  if (
    !playlist.creator.equals(req.user._id) &&
    !playlist.collaborators.some((collab) => collab.equals(req.user._id))
  )
    return next(
      new AppError('You are not authorized to modify this playlist', 403),
    );
  const { songId } = req.params;

  //   Check if the song is in the playlist
  if (!playlist.songs.includes(songId))
    return next(new AppError('song is not in the playlist', 400));

  playlist.songs = playlist.songs.filter((id) => id.toString() !== songId);
  await playlist.save();
  res.status(200).json({
    status: 'success',
    data: {
      playlist,
    },
  });
});

// @desc - Add collaborator to playlist
// @route - PUT api/v1/playlists/:id/add-collaborator
// @Access - Private

const addCollaborator = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return next(new AppError('playlist not found', 404));

  //   only creator can add collaborator
  if (!playlist.creator.equals(req.user._id))
    return next(
      new AppError('You are not authorized to modify this playlist', 403),
    );

  // Check if the user is already exists
  const userExistence = await User.findById(userId);
  if (!userExistence) return next(new AppError('User does not exist', 404));

  // check if user is already a collaborator
  if (playlist.collaborators.includes(userId))
    return next(new AppError('User is already a collaborator', 400));

  playlist.collaborators.push(userId);
  await playlist.save();
  res.status(200).json({
    status: 'success',
    data: {
      playlist,
    },
  });
});

// @desc - Remove collaborator from playlist
// @route - PUT api/v1/playlists/:id/remove-collaborator
// @Access - Private

const removeCollaborator = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  // Check if the user is already exists
  const userExistence = await User.findById(userId);
  if (!userExistence) return next(new AppError('User does not exist', 404));

  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return next(new AppError('playlist not found', 404));

  //   only creator can remove collaborator
  if (!playlist.creator.equals(req.user._id))
    return next(
      new AppError('You are not authorized to modify this playlist', 403),
    );

  // check if user is already a collaborator
  if (!playlist.collaborators.includes(userId))
    return next(new AppError('User is not a collaborator', 400));

  playlist.collaborators = playlist.collaborators.filter(
    (id) => id.toString() !== userId,
  );
  await playlist.save();
  res.status(200).json({
    status: 'success',
    data: {
      playlist,
    },
  });
});

// @desc - Get featured playlist
// @route - GET api/v1/playlists/featured?limit=10
// @Access - Private

const getFeaturedPlaylists = asyncHandler(async (req, res, next) => {
  const { limit = 5 } = req.query;
  const featuredPlaylists = await Playlist.find({ isPublic: true })
    .limit(parseInt(limit))
    .sort('-followers')
    .populate('creator', 'name profilePicture');

  res.status(200).json({
    status: 'success',
    results: featuredPlaylists.length,
    data: {
      playlists: featuredPlaylists,
    },
  });
});

module.exports = {
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
};
