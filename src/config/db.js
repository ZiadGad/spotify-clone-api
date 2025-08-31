const mongoose = require('mongoose');

let DB = process.env.DB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

const mongoConnect = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    DB = process.env.MONGO_URL;
  }
  await mongoose.connect(DB);
};

const mongoDisconnect = async () => {
  await mongoose.connection.close();
};

module.exports = {
  mongoConnect,
  mongoDisconnect,
};

// Listeners
mongoose.connection.once('open', () => {
  console.log(`DB connected successfully`);
});

mongoose.connection.on('error', (err) => {
  console.log(err);
});
