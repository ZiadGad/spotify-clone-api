const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Artist name is required'],
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2021/03/02/16/34/woman-6063087_1280.jpg',
    },
    genres: [
      {
        type: String,
        ref: 'Song',
      },
    ],
    followers: {
      type: Number,
      default: 0,
    },
    albums: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
      },
    ],
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
    isVerfied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
