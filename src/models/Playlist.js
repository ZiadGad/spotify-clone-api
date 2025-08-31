const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Playlist name is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      default:
        'https://media.istockphoto.com/id/2174476898/vector/retro-record-show-flyer-poster-in-punk-zine-photocopy-style-hand-drawn-advertisement-web.jpg?s=2048x2048&w=is&k=20&c=UUuTBxhphg1Lobn-yInpOWls-HnqibEsSjQyZZ3YwKA=',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    followers: {
      type: Number,
      default: 0,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
