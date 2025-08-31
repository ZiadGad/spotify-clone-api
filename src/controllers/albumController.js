const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const {
  uploadToCloudinary,
  removeFromCloudinary,
} = require('../utils/cloudinaryUploads');
const ApiFeature = require('../utils/apiFeatures');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const { cleanupFile } = require('../utils/cleanupFile');

// @desc - Create new album
// @route - POST api/v1/albums
// @Access - Private/Admin

const createAlbum = asyncHandler(async (req, res, next) => {
  const { title, artistId, releaseDate, genre, description, isExplicit } =
    req.body;

  const existingAlbum = await Album.findOne({ title });
  if (existingAlbum) {
    cleanupFile(req.file?.path);
    return next(new AppError('Album title already exists', 400));
  }

  const artist = await Artist.findById(artistId);
  if (!artist) {
    cleanupFile(req.file?.path);
    return next(new AppError('Cannot add album to non-existent artist', 404));
  }

  // Handle file upload
  let coverImgUrl = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'spotify/albums');
    coverImgUrl = result.secure_url;
  }

  const newAlbum = await Album.create({
    title,
    artist: artistId,
    releaseDate: releaseDate ? new Date(releaseDate) : Date.now(),
    coverImage: coverImgUrl || undefined,
    genre,
    description,
    isExplicit: isExplicit === 'true',
  });

  // Add album to artist
  artist.albums.push(newAlbum._id);
  await artist.save();

  res.status(201).json({
    status: 'success',
    data: {
      album: newAlbum,
    },
  });
});

// @desc - Get all albums with filtering and pagination
// @route - GET api/v1/albums?genre=Rock&artist=65322152&search=dark&page=1&limit=10
// @Access - Public

const getAlbums = asyncHandler(async (req, res, next) => {
  const documentsCount = await Album.countDocuments();
  const features = new ApiFeature(Album.find(), req.query)
    .filter()
    .sort()
    .search('album')
    .paginate(documentsCount);

  const { query, metadata } = features;
  const albums = await query.populate('artist', 'name image');
  res.status(200).json({
    status: 'success',
    results: albums.length,
    metadata,
    data: {
      albums,
    },
  });
});

//! @desc - Get album by ID
// @route - GET api/v1/albums/:id
// @Access - Public

const getAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id).populate(
    'artist',
    'name image bio',
  );
  if (!album)
    return next(new AppError('Album with this id does not exist', 404));
  res.status(200).json({ status: 'success', data: { album } });
});

// @desc - Update album details
// @route - PUT api/v1/albums/:id
// @Access - Private/Admin

const updateAlbum = asyncHandler(async (req, res, next) => {
  const { title, releaseDate, genre, description, isExplicit } = req.body;

  const album = await Album.findByIdAndUpdate(req.params.id);
  if (!album) {
    cleanupFile(req.file?.path);
    return next(new AppError('No album with this id', 404));
  }

  album.title = title || album.title;
  album.releaseDate = releaseDate || album.releaseDate;
  album.genre = genre || album.genre;
  album.description = description || album.description;
  album.isExplicit =
    isExplicit !== undefined ? isExplicit === 'true' : album.isExplicit;

  // image if provided
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'spotify/albums');
    album.image = result.secure_url;
  }

  // resave
  const updatedAlbum = await album.save({ validateBeforeSave: true });

  res.status(200).json({ status: 'success', data: { album: updatedAlbum } });
});

// @desc - Delete album
// @route - DELETE api/v1/albums/:id
// @Access - Private/Admin

const deleteAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id);
  if (!album) return next(new AppError('Album not found', 404));

  // Remove album from artist's albums
  await Artist.updateOne(
    { _id: album.artist },
    { $pull: { albums: album._id } },
  );

  // Update Songs to remove album reference
  await Song.updateMany({ album: album._id }, { $unset: { album: 1 } });
  const url = album.coverImage;
  await album.deleteOne();
  await removeFromCloudinary(url);
  res.status(204).json({
    data: null,
  });
});

// @desc - Add Song to album
// @route - PUT api/v1/albums/:id/add-songs
// @Access - Private/Admin

const addSongsToAlbum = asyncHandler(async (req, res, next) => {});

// @desc - Remove Song from album
// @route - PUT api/v1/albums/:id/add-songs/:songId
// @Access - Private/Admin

const removeSongFromAlbum = asyncHandler(async (req, res, next) => {});

// @desc - Get new releases (recently add albums)
// @route - PUT api/v1/albums/new-releases?limit=10
// @Access - Public

const getNewReleases = asyncHandler(async (req, res, next) => {});

module.exports = {
  createAlbum,
  getAlbums,
  getAlbum,
  updateAlbum,
  deleteAlbum,
  addSongsToAlbum,
  removeSongFromAlbum,
  getNewReleases,
};
