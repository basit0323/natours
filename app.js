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
const cors = require('cors');

const AppError = require('./utils/appErrors');
const globalErrorHandler = require('./controllers/errorHandler');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingController = require('./controllers/bookingControllers');

const app = express();

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

app.set('trust proxy', 1);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.options(/.*/, cors());

app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }

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

  req.safeBody = mongoSanitize.sanitize(req.body);

  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(compression());

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
