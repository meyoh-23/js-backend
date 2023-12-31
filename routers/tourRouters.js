const express = require('express');
const tourController = require('./../controllers/toursControllers');
const authController = require('./../controllers/authController');

const router = express.Router();

//param middleware -064 -param-middleware
//router.param('id',tourController.checkID);

router
.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours);

router
.route('/tour-stats',)
.get(tourController.getTourStats);

router
.route('/monthly-plan/:year')
.get(tourController.getMonthlyPlan);

//chaining multiple middlewear functions
router
.route('/')
.get(
    authController.protect,
    tourController.getAllTours
    )
.post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createNewTour
    );

router
.route('/')
.get(tourController.getAllTours)
.post(tourController.createNewTour);

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
    );

module.exports = router;