// app.js
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appErrors');
const globalErrorHandler = require('./controllers/errorHandler');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
// Starting app here
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// 2️⃣ MANUAL SANITIZATION MIDDLEWARE
app.use((req, res, next) => {
  // Sanitize req.body
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }

  // Sanitize req.query
  req.safeQuery = {};
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.safeQuery[key] = xss(req.query[key]);
      } else {
        req.safeQuery[key] = req.query[key];
      }
    }
  }

  // Sanitize req.params
  req.safeParams = {};
  if (req.params) {
    for (let key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.safeParams[key] = xss(req.params[key]);
      } else {
        req.safeParams[key] = req.params[key];
      }
    }
  }

  // Optional: Manual NoSQL sanitization
  req.safeBody = mongoSanitize.sanitize(req.body);

  next();
});

// Test middleware for request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(compression);

// 3️⃣ ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handle unhandled routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4️⃣ GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
