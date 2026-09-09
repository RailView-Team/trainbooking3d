const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createBooking, listMyBookings, cancelBooking } = require('../controllers/bookingController');

router.use(authMiddleware); // all booking routes require login

router.post('/', createBooking);
router.get('/', listMyBookings);
router.delete('/:id', cancelBooking);

module.exports = router;
