const asyncHandler = require('express-async-handler');
const Artist = require('../models/Artist');
const AppError = require('../utils/AppError');
const Album = require('../models/Album');
const Song = require('../models/Song');
const {
  uploadToCloudinary,
  removeFromCloudinary,
} = require('../utils/cloudinaryUploads');
const ApiFeature = require('../utils/apiFeatures');
const { cleanupFile } = require('../utils/cleanupFile');

// @desc - Create a new artist
// @route - POST api/v1/artists
// @Access - Private/Admin

const createArtist = asyncHandler(async (req, res, next) => {
  const { name, bio, genres } = req.body;

  const existingArtist = await Artist.findOne({ name });

  if (existingArtist) {
    cleanupFile(req.file?.path);
    return next(new AppError('Artist name already exists', 400));
  }

  let imageURL = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'spotify/artists');
    imageURL = result.secure_url;
  }
  const artist = await Artist.create({
    name,
    bio,
    genres,
    isVerified: true,
    image: imageURL,
  });
  res.status(201).json({
    status: 'success',
    data: {
      artist,
    },
  });
});

// @desc - Get all artists with filtering and pagination
// @route - GET api/v1/artists?genre=rock&search=pink&page=1&limit=10
// @Access - Public

const getArtists = asyncHandler(async (req, res, next) => {
  const documentsCount = await Artist.countDocuments();
  const features = new ApiFeature(Artist.find(), req.query)
    .filter()
    .sort('-releaseDate')
    .search('artist')
    .paginate(documentsCount);

  const { query, metadata } = features;
  const artists = await query;

  res.status(200).json({ results: artists.length, metadata, artists });
});

//! @desc - Get artist by ID
// @route - GET api/v1/artists/id
// @Access - Public

const getArtistById = asyncHandler(async (req, res, next) => {
  const artist = await Artist.findById(req.params.id);
  if (!artist) return next(new AppError('No Artist with this id', 404));
  res.status(200).json({ artist });
});

// @desc - Update artist details
// @route - PUT api/v1/artists/id
// @Access - Private/Admin

const updateArtist = asyncHandler(async (req, res, next) => {
  const { name, bio, genres, isVerified } = req.body;
  const artist = await Artist.findByIdAndUpdate(req.params.id);
  if (!artist) {
    cleanupFile(req.file?.path);
    return next(new AppError('No Artist with this id', 404));
  }
  artist.name = name || artist.name;
  artist.bio = bio || artist.bio;
  artist.genres = genres || artist.genres;
  artist.isVerified = isVerified !== undefined ? isVerified : artist.isVerified;

  // image if provided
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'spotify/artists');
    artist.image = result.secure_url;
  }

  // resave
  const updatedUser = await artist.save({ validateBeforeSave: true });

  res.status(200).json({ status: 'success', data: { artist: updatedUser } });
});

// @desc - Delete artist
// @route - DELETE api/v1/artists/id
// @Access - Private/Admin

const deleteArtist = asyncHandler(async (req, res, next) => {
  const artist = await Artist.findById(req.params.id);
  if (!artist) return next(new AppError('No Artist with this id', 404));

  // Delete all songs by artist
  await Song.deleteMany({ artist: artist._id });
  // Delete all ablums by artist
  await Album.deleteMany({ artist: artist._id });

  const url = artist.image;
  await artist.deleteOne();
  await removeFromCloudinary(url);
  res.status(204).json({ status: 'success', data: null });
});

// @desc - Get top 10 artists
// @route - GET api/v1/artists/top?limit=10
// @Access - Public

const getTopArtists = asyncHandler(async (req, res, next) => {
  const { limit } = req.query;
  const artists = await Artist.find()
    .sort('-followers')
    .limit(parseInt(limit) || 10);
  res.status(200).json({
    status: 'success',
    data: {
      artists,
    },
  });
});

// @desc - Get artist top songs
// @route - GET api/v1/artists/:id/top-songs?limit=5
// @Access - Public

const getArtistTopSongs = asyncHandler(async (req, res, next) => {
  const { limit } = req.query;
  const songs = await Song.find({ artist: req.params.id })
    .sort('-plays')
    .limit(parseInt(limit || 5))
    .populate('album', 'title coverImage');
  if (songs <= 0) {
    return next(new AppError('No songs found for this artist', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      songs,
    },
  });
});

module.exports = {
  createArtist,
  getArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  getTopArtists,
  getArtistTopSongs,
};
