const albumRouter = require('./albumRoutes');
const artistRouter = require('./artistRoutes');
const playlistRouter = require('./playlistRoutes');
const songRouter = require('./songRoutes');
const userRouter = require('./userRoutes');

const mountRoutes = (app) => {
  app.get('/', (req, res) => {
    res
      .status(200)
      .send(
        '<h1 style="text-align:center">Welcome to Spotify Clone API 🤗</h1>',
      );
  });
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/artists', artistRouter);
  app.use('/api/v1/albums', albumRouter);
  app.use('/api/v1/songs', songRouter);
  app.use('/api/v1/playlists', playlistRouter);
};

module.exports = mountRoutes;
