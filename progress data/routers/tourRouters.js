const express = require('express');
const tourController = require('./../controllers/toursControllers');

const router = express.Router();

router
.route('/')
.get(tourController.getAllTours)
.post(tourController.createNewTour);

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(tourController.deleteTour);

module.exports = router;