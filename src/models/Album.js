const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Album title is required'],
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: [true, 'Artist is required'],
    },
    releaseDate: {
      type: Date,
      default: Date.now(),
    },
    coverImage: {
      type: String,
      default:
        'https://media.istockphoto.com/id/2174476898/vector/retro-record-show-flyer-poster-in-punk-zine-photocopy-style-hand-drawn-advertisement-web.jpg?s=2048x2048&w=is&k=20&c=UUuTBxhphg1Lobn-yInpOWls-HnqibEsSjQyZZ3YwKA=',
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
    genre: {
      type: String,
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    isExplicit: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
