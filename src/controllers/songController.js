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
const { cleanupFile, cleanupAllFiles } = require('../utils/cleanupFile');

// @desc - Create a new song
// @route - POST api/v1/songs
// @Access - Private/Admin

const createSong = asyncHandler(async (req, res, next) => {
  const {
    title,
    artist,
    album,
    duration,
    genre,
    lyrics,
    isExplicit,
    featuredArtists,
  } = req.body;

  const existingArtist = await Artist.findById(artist);
  if (!existingArtist) {
    cleanupAllFiles(req);
    return next(new AppError('Cannot add song to non-existent artist', 404));
  }

  // upload audio
  if (!req.files || !req.files.audio) {
    cleanupAllFiles(req);
    return next(new AppError('Audio file is required', 400));
  }
  const audioResult = await uploadToCloudinary(
    req.files.audio[0].path,
    'spotify/songs',
  );
  // upload image
  let coverImage = '';
  if (req.files && req.files.cover) {
    const imageResult = await uploadToCloudinary(
      req.files.cover[0].path,
      'spotify/covers',
    );

    coverImage = imageResult.secure_url;
  }
  // create song
  const song = await Song.create({
    title,
    artist,
    album: album || null,
    duration,
    audioUrl: audioResult.secure_url,
    coverImage,
    genre,
    lyrics,
    isExplicit: isExplicit === 'true',
    featuredArtists: featuredArtists ? JSON.parse(featuredArtists) : [],
  });
  // Add song to artist's songs
  existingArtist.songs.push(song._id);
  await existingArtist.save();
  // add song to album if album id is provided
  if (album) {
    const albumDoc = await Album.findById(song.album);
    albumDoc.songs.push(song._id);
    await albumDoc.save();
  }

  res.status(201).json({
    status: 'success',
    data: {
      song,
    },
  });
});

// @desc - Get all songs
// @route - GET api/v1/songs?genre=Rock&artist=166115&search=comfort&page=1&limit=1
// @Access - Public

const getAllSongs = asyncHandler(async (req, res, next) => {
  const documentsCount = await Song.countDocuments();
  const features = new ApiFeature(Song.find(), req.query)
    .filter()
    .sort()
    .search('song')
    .paginate(documentsCount);

  const { query, metadata } = features;
  const songs = await query
    .populate('artist', 'name image')
    .populate('album', 'name coverImage')
    .populate('featuredArtists', 'name');
  res.status(200).json({
    status: 'success',
    results: songs.length,
    metadata,
    data: {
      songs,
    },
  });
});

// @desc - Get Specific song
// @route - GET api/v1/songs/:id
// @Access - Public

const getSong = asyncHandler(async (req, res, next) => {
  const song = await Song.findById(req.params.id)
    .populate('artist', 'name image bio')
    .populate('album', 'title coverImage releaseDate')
    .populate('featuredArtists', 'name image');
  if (!song) return next(new AppError('song with this id does not exist', 404));

  // Increment plays count
  song.plays += 1;
  await song.save();
  res.status(200).json({ status: 'success', data: { song } });
});

// @desc - Update Specific song
// @route - PUT api/v1/songs/:id
// @Access - Private/Admin

const updateSong = asyncHandler(async (req, res, next) => {
  const {
    title,
    artist,
    album,
    duration,
    genre,
    lyrics,
    isExplicit,
    featuredArtists,
  } = req.body;

  const song = await Song.findById(req.params.id);
  if (!song) {
    cleanupAllFiles(req);
    return next(new AppError('song with this id does not exist', 404));
  }

  song.title = title || song.title;
  song.album = album || song.album;
  song.genre = genre || song.genre;
  song.lyrics = lyrics || song.lyrics;
  song.artist = artist || song.artist;
  song.duration = duration || song.duration;
  song.isExplicit =
    isExplicit !== undefined ? isExplicit === 'true' : song.isExplicit;
  song.featuredArtists = featuredArtists
    ? JSON.parse(featuredArtists)
    : song.featuredArtists;

  // update cover image if provided
  if (req.files && req.files.cover) {
    const imageResult = await uploadToCloudinary(
      req.files.cover[0].path,
      'spotify/covers',
    );
    song.coverImage = imageResult.secure_url;
  }

  // update audio if provided
  if (req.files && req.files.audio) {
    const audioResult = await uploadToCloudinary(
      req.files.audio[0].path,
      'spotify/songs',
    );
    song.audioUrl = audioResult.secure_url;
  }

  const updatedSong = await song.save();
  res.status(200).json({
    status: 'success',
    data: {
      song: updatedSong,
    },
  });
});

// @desc - Delete Specific song
// @route - DELETE api/v1/songs/:id
// @Access - Private/Admin

const deleteSong = asyncHandler(async (req, res, next) => {
  const song = await Song.findById(req.params.id);
  if (!song) return next(new AppError('song with this id does not exist', 404));

  // Remove song from Artist's songs
  await Artist.updateOne({ _id: song.artist }, { $pull: { songs: song._id } });

  // Remove song from Album if it belongs to one
  if (song.album) {
    await Album.updateOne({ _id: song.album }, { $pull: { songs: song._id } });
  }

  const imageUrl = song.coverImage;
  const audioUrl = song.audioUrl;
  await song.deleteOne();
  await removeFromCloudinary(imageUrl);
  await removeFromCloudinary(audioUrl);
  res.status(204).json({
    data: null,
  });
});

// @desc - Get top songs by plays
// @route - GET api/v1/songs/top?limit=5
// @Access - Public

const getTopSongs = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  const songs = await Song.find()
    .sort('-plays')
    .limit(limit)
    .populate('artist', 'name  image')
    .populate('album', 'title  coverImage');
  res.status(200).json({
    status: 'success',
    data: {
      songs,
    },
  });
});

// @desc - Get new releases (recently added songs)
// @route - GET api/v1/songs/new-releases?limit=10
// @Access - Public

const getNewReleases = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  const songs = await Song.find()
    .sort('-createdAt')
    .limit(limit)
    .populate('artist', 'name  image')
    .populate('album', 'title  coverImage');
  res.status(200).json({
    status: 'success',
    data: {
      songs,
    },
  });
});

module.exports = {
  createSong,
  getAllSongs,
  getSong,
  updateSong,
  deleteSong,
  getTopSongs,
  getNewReleases,
};
