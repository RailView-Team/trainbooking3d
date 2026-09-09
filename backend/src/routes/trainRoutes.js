const express = require('express');
const router = express.Router();
const {
  createTrain,
  searchTrains,
  getAvailability,
  getLocation,
  getStatus,
  simulateNext,
} = require('../controllers/trainController');

// Order matters: /search must come before /:trainId routes
router.post('/', createTrain);
router.get('/search', searchTrains);
router.get('/:trainId/availability', getAvailability);
router.get('/:trainId/location', getLocation);
router.get('/:trainId/status', getStatus);
router.post('/:trainId/simulate/next', simulateNext);

module.exports = router;
