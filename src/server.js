const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION. Shutting down...');
  console.log(err.name, err.message, err);
  process.exit(1);
});

dotenv.config({ path: '.env' });
const app = require('./app');
const { mongoConnect } = require('./config/db');

mongoConnect();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Running in ${process.env.NODE_ENV} environment`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION Shuting down...');

  server.close(() => {
    process.exit(1);
  });
});
