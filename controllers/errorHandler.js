const AppError = require('./../utils/appErrors');

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const value = err.errmsg.match(/\"(.*?)\"/)[0];
  const message = `Duplicate field value : ${value}, Please try a different value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid input fields : ${errors}`;
  return new AppError(message, 400);
};

const handlejwtError = () =>
  new AppError('invalid web token! Please login again', 401);

const handleExpireError = () =>
  new AppError('your token has been expired! Please login again', 401);

const sendErrorDev = (err, req, res) => {
  // A) FOR API
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });

  // B) FOR RENDERED WEBSITEs
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'something went wrong on the server!',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'something went wrong',
        msg: err.message,
      });
    } else {
      res
        .status(500)
        .render('error', {
          title: 'something went wrong',
          msg: 'something went wrong on the server',
        });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateErrorDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handlejwtError();
    if (err.name === 'TokenExpiredError') err = handleExpireError();

    sendErrorProd(err, req, res);
  }
};
