const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', { title: 'All tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate(
    'reviews'
  );

  if (!tour) return next(new AppError('No tour found with the name', 403));

  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

exports.login = (req, res) => {
  res.status(200).render('login', { title: 'Login to your account' });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your account info' });
};

exports.getBookedTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.render('overview', { title: 'Your booked tours', tours });
});

exports.alert = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking') {
    res.locals.alert =
      "You booking was successfull! Please check your mailbox for a confirmation email! If your booking doesn't show up immidiatly Please come back later.";
  }

  next();
};
