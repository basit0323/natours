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

/* -------------------------------------------------- */
/* 🔥 STRIPE WEBHOOK — MUST BE FIRST 🔥 */
/* -------------------------------------------------- */
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

/* -------------------------------------------------- */
/* GLOBAL CONFIG */
/* -------------------------------------------------- */
app.set('trust proxy', 1);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/* -------------------------------------------------- */
/* SECURITY & UTILITIES */
/* -------------------------------------------------- */
app.use(cors());
app.options('*', cors());

app.use(
  helmet({
    contentSecurityPolicy: false, // Stripe-safe
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting (API ONLY)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});
app.use('/api', limiter);

/* -------------------------------------------------- */
/* BODY PARSERS (AFTER WEBHOOK) */
/* -------------------------------------------------- */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------------------------------------- */
/* DATA SANITIZATION */
/* -------------------------------------------------- */
app.use(mongoSanitize());

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

// Manual XSS sanitization
app.use((req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
});

/* -------------------------------------------------- */
/* STATIC & PERFORMANCE */
/* -------------------------------------------------- */
app.use(express.static(`${__dirname}/public`));
app.use(compression());

/* -------------------------------------------------- */
/* ROUTES */
/* -------------------------------------------------- */
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

/* -------------------------------------------------- */
/* ERROR HANDLING */
/* -------------------------------------------------- */
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
