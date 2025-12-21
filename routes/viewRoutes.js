const express = require('express');

const viewController = require('../controllers/viewControllers');
const authConroller = require('../controllers/authControllers');
const bookingConroller = require('../controllers/bookingControllers');

const router = express.Router();

router.use(viewController.alert);

router.get('/', authConroller.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authConroller.isLoggedIn, viewController.getTour);
router.get('/login', authConroller.isLoggedIn, viewController.login);
router.get('/me', authConroller.protect, viewController.getAccount);
router.get(
  '/my-booked-tours',
  authConroller.protect,
  viewController.getBookedTours
);

module.exports = router;
