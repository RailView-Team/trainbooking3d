const db = require('../db');
const bookingService = require('../services/bookingService');

/**
 * POST /api/bookings
 * Protected route — requires JWT. userId comes from the token, not the body.
 */
async function createBooking(req, res) {
  try {
    const { trainId, journeyDate, from, to, seatId, passenger } = req.body;

    if (!trainId || !journeyDate || !from || !to || !seatId || !passenger) {
      return res.status(400).json({
        error: 'trainId, journeyDate, from, to, seatId, and passenger are required',
      });
    }
    if (!passenger.name || !passenger.age || !passenger.gender) {
      return res.status(400).json({ error: 'passenger must include name, age, and gender' });
    }

    const result = await bookingService.createBooking({
      userId: req.user.id,
      trainId: parseInt(trainId, 10),
      journeyDate,
      from,
      to,
      seatId: parseInt(seatId, 10),
      passenger,
    });

    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    return res.status(201).json(result.booking);
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ error: 'Something went wrong creating the booking' });
  }
}

/**
 * GET /api/bookings
 * Lists the logged-in user's own bookings.
 */
async function listMyBookings(req, res) {
  try {
    const result = await db.query(
      `SELECT
         b.id, b.pnr, b."journeyDate", b.status, b."createdAt",
         t."trainNumber", t.name AS "trainName",
         boarding.name AS "boardingStation", dest.name AS "destinationStation",
         seat."seatNumber", coach."coachNumber"
       FROM "Booking" b
       JOIN "Train" t ON t.id = b."trainId"
       JOIN "Station" boarding ON boarding.id = b."boardingStationId"
       JOIN "Station" dest ON dest.id = b."destinationStationId"
       LEFT JOIN "BookingSeat" bs ON bs."bookingId" = b.id
       LEFT JOIN "Seat" seat ON seat.id = bs."seatId"
       LEFT JOIN "Coach" coach ON coach.id = seat."coachId"
       WHERE b."userId" = $1
       ORDER BY b."createdAt" DESC`,
      [req.user.id]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('List bookings error:', err);
    return res.status(500).json({ error: 'Something went wrong fetching your bookings' });
  }
}

/**
 * DELETE /api/bookings/:id
 * Cancels a booking (soft delete). Only the owner can cancel.
 */
async function cancelBooking(req, res) {
  try {
    const bookingId = parseInt(req.params.id, 10);

    const result = await bookingService.cancelBooking(bookingId, req.user.id);

    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    return res.json({ message: 'Booking cancelled successfully', booking: result.booking });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ error: 'Something went wrong cancelling the booking' });
  }
}

module.exports = { createBooking, listMyBookings, cancelBooking };
