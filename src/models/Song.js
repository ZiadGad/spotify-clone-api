const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Song title is required'],
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: [true, 'Artist is required'],
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
    },
    duration: {
      type: Number,
      required: [true, 'Song duration is required'],
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio url is required'],
    },
    coverImage: {
      type: String,
      default:
        'https://media.istockphoto.com/id/2174476898/vector/retro-record-show-flyer-poster-in-punk-zine-photocopy-style-hand-drawn-advertisement-web.jpg?s=2048x2048&w=is&k=20&c=UUuTBxhphg1Lobn-yInpOWls-HnqibEsSjQyZZ3YwKA=',
    },
    releasedDate: {
      type: Date,
      default: Date.now(),
    },
    genre: {
      type: String,
      trim: true,
    },
    plays: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isExplicit: {
      type: Boolean,
      default: false,
    },
    featuredArtists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Song = mongoose.model('Song', songSchema);

module.exports = Song;
