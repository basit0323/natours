const express = require('express');

const reviewController = require('../controllers/reviewControllers');
const authController = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.protect,
    authController.protectTo('user'),
    reviewController.checkUserIdPassword,
    reviewController.createReview
  )
  .get(authController.protect, reviewController.getReviews);

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.protectTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.protectTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
