const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const mountRoutes = require('./routes');
const AppError = require('./utils/AppError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');

const app = express();

// Middlewares
app.use(cors());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded());

app.use(helmet());

const apiLimiter = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes!',
});

const loginLimiter = rateLimit({
  max: 20,
  windowMs: 15 * 60 * 1000,
  message:
    'Too many login attempts from this IP, please try again after 15 minutes!',
});

app.use('/api', apiLimiter);
app.use('/api/v1/users/login', loginLimiter);

// app.use(mongoSanitize());
// app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
mountRoutes(app);

app.use((req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} in this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
