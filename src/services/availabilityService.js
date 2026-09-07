const db = require('../db');

/**
 * SEGMENT-BASED SEAT AVAILABILITY
 * ---------------------------------
 * A seat is not simply "available" or "booked". It is booked only for the
 * segment of the route between the passenger's boarding station and their
 * destination station (identified by sequence numbers along the route).
 *
 * Two journeys overlap (i.e. conflict) if:
 *   existingStart < requestedEnd  AND  existingEnd > requestedStart
 *
 * If they don't overlap, the same physical seat can be reused.
 */

/**
 * Returns true if [existingStart, existingEnd) overlaps [requestedStart, requestedEnd).
 */
function segmentsOverlap(existingStart, existingEnd, requestedStart, requestedEnd) {
  return existingStart < requestedEnd && existingEnd > requestedStart;
}

/**
 * Fetches all CONFIRMED bookings for a given seat, on a given train + journey date.
 * Returns an array of { boardingSequence, destinationSequence }.
 */
async function getSeatBookedSegments(seatId, trainId, journeyDate) {
  const result = await db.query(
    `SELECT b."boardingSequence", b."destinationSequence"
     FROM "Booking" b
     JOIN "BookingSeat" bs ON bs."bookingId" = b.id
     WHERE bs."seatId" = $1
       AND b."trainId" = $2
       AND b."journeyDate" = $3
       AND b.status = 'CONFIRMED'`,
    [seatId, trainId, journeyDate]
  );
  return result.rows;
}

/**
 * Checks whether a specific seat is available for the requested segment.
 * Returns true if available, false if it conflicts with an existing booking.
 */
async function isSeatAvailable(seatId, trainId, journeyDate, requestedStart, requestedEnd) {
  const bookedSegments = await getSeatBookedSegments(seatId, trainId, journeyDate);

  for (const segment of bookedSegments) {
    if (
      segmentsOverlap(
        segment.boardingSequence,
        segment.destinationSequence,
        requestedStart,
        requestedEnd
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Returns availability info for every seat on a train, for the requested
 * segment [requestedStart, requestedEnd), grouped by coach.
 *
 * Shape:
 * [
 *   { coachId, coachNumber, classType, seats: [{ seatId, seatNumber, seatType, available }] }
 * ]
 */
async function getTrainAvailability(trainId, journeyDate, requestedStart, requestedEnd) {
  const coachesResult = await db.query(
    `SELECT id, "coachNumber", "classType" FROM "Coach" WHERE "trainId" = $1 ORDER BY "coachNumber" ASC`,
    [trainId]
  );

  const coaches = [];

  for (const coach of coachesResult.rows) {
    const seatsResult = await db.query(
      `SELECT id, "seatNumber", "seatType" FROM "Seat" WHERE "coachId" = $1 ORDER BY "seatNumber" ASC`,
      [coach.id]
    );

    // Fetch all booked segments for all seats in this coach in one query (more efficient
    // than one query per seat), then check overlap in memory.
    const seatIds = seatsResult.rows.map((s) => s.id);
    let bookingsBySeat = {};

    if (seatIds.length > 0) {
      const bookingsResult = await db.query(
        `SELECT bs."seatId", b."boardingSequence", b."destinationSequence"
         FROM "Booking" b
         JOIN "BookingSeat" bs ON bs."bookingId" = b.id
         WHERE bs."seatId" = ANY($1::int[])
           AND b."trainId" = $2
           AND b."journeyDate" = $3
           AND b.status = 'CONFIRMED'`,
        [seatIds, trainId, journeyDate]
      );

      bookingsBySeat = bookingsResult.rows.reduce((acc, row) => {
        if (!acc[row.seatId]) acc[row.seatId] = [];
        acc[row.seatId].push(row);
        return acc;
      }, {});
    }

    const seats = seatsResult.rows.map((seat) => {
      const segments = bookingsBySeat[seat.id] || [];
      const conflict = segments.some((seg) =>
        segmentsOverlap(seg.boardingSequence, seg.destinationSequence, requestedStart, requestedEnd)
      );

      return {
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        available: !conflict,
      };
    });

    coaches.push({
      coachId: coach.id,
      coachNumber: coach.coachNumber,
      classType: coach.classType,
      seats,
    });
  }

  return coaches;
}

module.exports = {
  segmentsOverlap,
  isSeatAvailable,
  getTrainAvailability,
  getSeatBookedSegments,
};
