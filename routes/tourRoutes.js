const express = require('express');
const tourControllers = require('../controllers/tourControllers');
const authControllers = require('../controllers/authControllers');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourControllers.aliasTopCheap, tourControllers.getAllTours);
router.route('/tour-stats').get(tourControllers.getTourStats);
router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlan);

router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    authControllers.protect,
    authControllers.protectTo('admin', 'lead-guide'),
    tourControllers.createTour
  );

router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourControllers.getToursWithin
);

router.get('/distances/:latlng/unit/:unit', tourControllers.getDistances);

router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authControllers.protect,
    authControllers.protectTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    tourControllers.updateTour
  )
  .delete(
    authControllers.protect,
    authControllers.protectTo('admin', 'lead-guide'),
    tourControllers.deleteTour
  );

module.exports = router;
