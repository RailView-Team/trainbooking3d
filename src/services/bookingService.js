const db = require('../db');
const availabilityService = require('./availabilityService');
const generatePNR = require('../utils/generatePNR');

/**
 * Resolves station codes into { boardingStation, destinationStation, boardingSequence,
 * destinationSequence } for a given train, validating that both stations are on the
 * train's route and that boarding comes before destination.
 *
 * Returns { error: "..." } if something is invalid.
 */
async function resolveRouteSegment(trainId, fromCode, toCode) {
  const trainResult = await db.query('SELECT id FROM "Train" WHERE id = $1', [trainId]);
  if (trainResult.rows.length === 0) {
    return { error: 'Train not found' };
  }

  const fromResult = await db.query(
    `SELECT s.id, s.name, s.code, ts.sequence
     FROM "TrainStation" ts
     JOIN "Station" s ON s.id = ts."stationId"
     WHERE ts."trainId" = $1 AND s.code = $2`,
    [trainId, fromCode.toUpperCase()]
  );
  if (fromResult.rows.length === 0) {
    return { error: `Station ${fromCode} is not on this train's route` };
  }

  const toResult = await db.query(
    `SELECT s.id, s.name, s.code, ts.sequence
     FROM "TrainStation" ts
     JOIN "Station" s ON s.id = ts."stationId"
     WHERE ts."trainId" = $1 AND s.code = $2`,
    [trainId, toCode.toUpperCase()]
  );
  if (toResult.rows.length === 0) {
    return { error: `Station ${toCode} is not on this train's route` };
  }

  const boardingStation = fromResult.rows[0];
  const destinationStation = toResult.rows[0];

  if (boardingStation.sequence >= destinationStation.sequence) {
    return { error: 'Boarding station must come before destination station on the route' };
  }

  return {
    boardingStation,
    destinationStation,
    boardingSequence: boardingStation.sequence,
    destinationSequence: destinationStation.sequence,
  };
}

/**
 * Checks whether the train has already passed the requested boarding station.
 * Uses the train's currentStationSequence (simulated real-time location).
 * If the train hasn't started yet (currentStationSequence is null), boarding
 * is always allowed.
 */
async function hasTrainPassedBoardingStation(trainId, boardingSequence) {
  const result = await db.query('SELECT "currentStationSequence" FROM "Train" WHERE id = $1', [trainId]);
  if (result.rows.length === 0) return false;

  const currentSequence = result.rows[0].currentStationSequence;
  if (currentSequence === null || currentSequence === undefined) return false;

  // The train has "passed" the boarding station if its current position is
  // already beyond that station's sequence number.
  return currentSequence > boardingSequence;
}

/**
 * Creates a booking. Runs everything inside a transaction so seat-availability
 * checking and booking-insertion are atomic (prevents a race where two requests
 * both see the seat as free and double-book it).
 */
async function createBooking({ userId, trainId, journeyDate, from, to, seatId, passenger }) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify train exists + resolve route segment (also validates stations + ordering)
    const routeInfo = await resolveRouteSegment(trainId, from, to);
    if (routeInfo.error) {
      await client.query('ROLLBACK');
      return { error: routeInfo.error, status: 400 };
    }

    // 2. Reject if the train has already passed the boarding station
    const alreadyPassed = await hasTrainPassedBoardingStation(trainId, routeInfo.boardingSequence);
    if (alreadyPassed) {
      await client.query('ROLLBACK');
      return { error: 'Train has already passed the boarding station', status: 400 };
    }

    // 3. Verify seat belongs to this train
    const seatResult = await client.query(
      `SELECT s.id, s."seatNumber", c."trainId", c."coachNumber"
       FROM "Seat" s
       JOIN "Coach" c ON c.id = s."coachId"
       WHERE s.id = $1`,
      [seatId]
    );
    if (seatResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { error: 'Seat not found', status: 404 };
    }
    const seat = seatResult.rows[0];
    if (seat.trainId !== trainId) {
      await client.query('ROLLBACK');
      return { error: 'This seat does not belong to the specified train', status: 400 };
    }

    // 4. Check segment-based availability (with a row lock on conflicting bookings
    //    to avoid race conditions between concurrent booking requests for the same seat)
    await client.query(
      `SELECT b.id FROM "Booking" b
       JOIN "BookingSeat" bs ON bs."bookingId" = b.id
       WHERE bs."seatId" = $1 AND b."trainId" = $2 AND b."journeyDate" = $3 AND b.status = 'CONFIRMED'
       FOR UPDATE`,
      [seatId, trainId, journeyDate]
    );

    const available = await availabilityService.isSeatAvailable(
      seatId,
      trainId,
      journeyDate,
      routeInfo.boardingSequence,
      routeInfo.destinationSequence
    );

    if (!available) {
      await client.query('ROLLBACK');
      return { error: 'Seat is not available for the requested segment', status: 409 };
    }

    // 5. Create the booking
    const pnr = generatePNR();

    const bookingResult = await client.query(
      `INSERT INTO "Booking"
        ("pnr", "userId", "trainId", "journeyDate", "boardingStationId", "destinationStationId",
         "boardingSequence", "destinationSequence", "status")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CONFIRMED')
       RETURNING *`,
      [
        pnr,
        userId,
        trainId,
        journeyDate,
        routeInfo.boardingStation.id,
        routeInfo.destinationStation.id,
        routeInfo.boardingSequence,
        routeInfo.destinationSequence,
      ]
    );
    const booking = bookingResult.rows[0];

    await client.query(
      `INSERT INTO "BookingSeat" ("bookingId", "seatId") VALUES ($1, $2)`,
      [booking.id, seatId]
    );

    let passengerRow = null;
    if (passenger) {
      const passengerResult = await client.query(
        `INSERT INTO "Passenger" ("bookingId", "name", "age", "gender") VALUES ($1, $2, $3, $4) RETURNING *`,
        [booking.id, passenger.name, passenger.age, passenger.gender]
      );
      passengerRow = passengerResult.rows[0];
    }

    await client.query('COMMIT');

    return {
      booking: {
        id: booking.id,
        pnr: booking.pnr,
        trainId: booking.trainId,
        journeyDate: booking.journeyDate,
        from: routeInfo.boardingStation.name,
        to: routeInfo.destinationStation.name,
        seat: { seatId: seat.id, seatNumber: seat.seatNumber, coachNumber: seat.coachNumber },
        passenger: passengerRow,
        status: booking.status,
      },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Cancels a booking (soft delete: sets status = CANCELLED). Verifies the
 * booking belongs to the requesting user.
 */
async function cancelBooking(bookingId, userId) {
  const result = await db.query('SELECT * FROM "Booking" WHERE id = $1', [bookingId]);
  if (result.rows.length === 0) {
    return { error: 'Booking not found', status: 404 };
  }

  const booking = result.rows[0];
  if (booking.userId !== userId) {
    return { error: 'You are not allowed to cancel this booking', status: 403 };
  }

  if (booking.status === 'CANCELLED') {
    return { error: 'Booking is already cancelled', status: 400 };
  }

  const updateResult = await db.query(
    `UPDATE "Booking" SET status = 'CANCELLED' WHERE id = $1 RETURNING *`,
    [bookingId]
  );

  return { booking: updateResult.rows[0] };
}

module.exports = {
  resolveRouteSegment,
  hasTrainPassedBoardingStation,
  createBooking,
  cancelBooking,
};
