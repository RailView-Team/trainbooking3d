const express = require('express');
const router = express.Router();
const { createStation, listStations } = require('../controllers/stationController');

router.post('/', createStation);
router.get('/', listStations);

module.exports = router;
