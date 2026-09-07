const db = require('../db');
const availabilityService = require('../services/availabilityService');
const bookingService = require('../services/bookingService');

/**
 * POST /api/trains
 * Creates a train with its route (ordered stations), coaches, and seats — all in one call.
 *
 * Body shape:
 * {
 *   "trainNumber": "12345",
 *   "name": "Howrah Delhi Express",
 *   "stations": [
 *     { "code": "HWH", "sequence": 0, "arrivalTime": null, "departureTime": "08:00" },
 *     { "code": "BDC", "sequence": 1, "arrivalTime": "09:30", "departureTime": "09:35" },
 *     ...
 *   ],
 *   "coaches": [
 *     { "coachNumber": "A1", "classType": "SLEEPER", "totalSeats": 10 },
 *     { "coachNumber": "A2", "classType": "SLEEPER", "totalSeats": 10 }
 *   ]
 * }
 */
async function createTrain(req, res) {
  const client = await db.pool.connect();
  try {
    const { trainNumber, name, stations, coaches } = req.body;

    if (!trainNumber || !name || !Array.isArray(stations) || stations.length < 2) {
      return res.status(400).json({
        error: 'trainNumber, name, and at least 2 stations (with sequence) are required',
      });
    }

    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM "Train" WHERE "trainNumber" = $1', [trainNumber]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'A train with this train number already exists' });
    }

    const trainResult = await client.query(
      `INSERT INTO "Train" ("trainNumber", "name", "status") VALUES ($1, $2, 'NOT_STARTED') RETURNING *`,
      [trainNumber, name]
    );
    const train = trainResult.rows[0];

    // Insert route (TrainStation rows), looking up each station by code.
    for (const stop of stations) {
      const stationResult = await client.query('SELECT id FROM "Station" WHERE code = $1', [stop.code]);
      if (stationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Station with code ${stop.code} does not exist. Create it first via POST /api/stations` });
      }
      const stationId = stationResult.rows[0].id;

      await client.query(
        `INSERT INTO "TrainStation" ("trainId", "stationId", "sequence", "arrivalTime", "departureTime")
         VALUES ($1, $2, $3, $4, $5)`,
        [train.id, stationId, stop.sequence, stop.arrivalTime || null, stop.departureTime || null]
      );
    }

    // Set initial location = first station in the route (sequence 0, or lowest sequence given)
    const firstStop = [...stations].sort((a, b) => a.sequence - b.sequence)[0];
    const secondStop = [...stations].sort((a, b) => a.sequence - b.sequence)[1];

    const firstStationRow = await client.query('SELECT id FROM "Station" WHERE code = $1', [firstStop.code]);
    const secondStationRow = await client.query('SELECT id FROM "Station" WHERE code = $1', [secondStop.code]);

    await client.query(
      `UPDATE "Train"
       SET "currentStationId" = $1, "currentStationSequence" = $2, "nextStationId" = $3, "lastLocationUpdate" = NOW()
       WHERE id = $4`,
      [firstStationRow.rows[0].id, firstStop.sequence, secondStationRow.rows[0].id, train.id]
    );

    // Insert coaches + seats
    if (Array.isArray(coaches)) {
      for (const coachDef of coaches) {
        const coachResult = await client.query(
          `INSERT INTO "Coach" ("trainId", "coachNumber", "classType") VALUES ($1, $2, $3) RETURNING id`,
          [train.id, coachDef.coachNumber, coachDef.classType || 'SLEEPER']
        );
        const coachId = coachResult.rows[0].id;

        const totalSeats = coachDef.totalSeats || 0;
        for (let i = 1; i <= totalSeats; i++) {
          const seatNumber = `${coachDef.coachNumber}-${String(i).padStart(2, '0')}`;
          await client.query(
            `INSERT INTO "Seat" ("coachId", "seatNumber", "seatType") VALUES ($1, $2, $3)`,
            [coachId, seatNumber, coachDef.seatType || 'SLEEPER']
          );
        }
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({ message: 'Train created successfully', trainId: train.id, trainNumber: train.trainNumber });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create train error:', err);
    return res.status(500).json({ error: 'Something went wrong creating the train' });
  } finally {
    client.release();
  }
}

/**
 * GET /api/trains/search?from=HWH&to=DHN&date=2026-09-10
 */
async function searchTrains(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query params are required (station codes)' });
    }

    const result = await db.query(
      `SELECT
         t.id AS "trainId", t."trainNumber", t.name,
         fromStation.name AS "fromName", fromStation.code AS "fromCode", fromTs.sequence AS "fromSequence",
         toStation.name AS "toName", toStation.code AS "toCode", toTs.sequence AS "toSequence"
       FROM "Train" t
       JOIN "TrainStation" fromTs ON fromTs."trainId" = t.id
       JOIN "Station" fromStation ON fromStation.id = fromTs."stationId"
       JOIN "TrainStation" toTs ON toTs."trainId" = t.id
       JOIN "Station" toStation ON toStation.id = toTs."stationId"
       WHERE fromStation.code = $1
         AND toStation.code = $2
         AND fromTs.sequence < toTs.sequence`,
      [from.toUpperCase(), to.toUpperCase()]
    );

    const trains = result.rows.map((row) => ({
      trainId: row.trainId,
      trainNumber: row.trainNumber,
      name: row.name,
      from: row.fromName,
      to: row.toName,
    }));

    return res.json(trains);
  } catch (err) {
    console.error('Search trains error:', err);
    return res.status(500).json({ error: 'Something went wrong searching for trains' });
  }
}

/**
 * GET /api/trains/:trainId/availability?from=HWH&to=DHN&date=2026-09-10
 */
async function getAvailability(req, res) {
  try {
    const trainId = parseInt(req.params.trainId, 10);
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ error: 'from, to, and date query params are required' });
    }

    const routeInfo = await bookingService.resolveRouteSegment(trainId, from, to);
    if (routeInfo.error) {
      return res.status(400).json({ error: routeInfo.error });
    }

    const coaches = await availabilityService.getTrainAvailability(
      trainId,
      date,
      routeInfo.boardingSequence,
      routeInfo.destinationSequence
    );

    return res.json({
      trainId,
      from: routeInfo.boardingStation.name,
      to: routeInfo.destinationStation.name,
      journeyDate: date,
      coaches,
    });
  } catch (err) {
    console.error('Get availability error:', err);
    return res.status(500).json({ error: 'Something went wrong fetching availability' });
  }
}

/**
 * GET /api/trains/:trainId/location
 */
async function getLocation(req, res) {
  try {
    const trainId = parseInt(req.params.trainId, 10);

    const result = await db.query(
      `SELECT
         t.id, t."trainNumber", t.status, t."lastLocationUpdate",
         cur.name AS "currentStationName", cur.code AS "currentStationCode", t."currentStationSequence",
         next.name AS "nextStationName", next.code AS "nextStationCode",
         nextTs.sequence AS "nextStationSequence"
       FROM "Train" t
       LEFT JOIN "Station" cur ON cur.id = t."currentStationId"
       LEFT JOIN "Station" next ON next.id = t."nextStationId"
       LEFT JOIN "TrainStation" nextTs ON nextTs."trainId" = t.id AND nextTs."stationId" = t."nextStationId"
       WHERE t.id = $1`,
      [trainId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }

    const row = result.rows[0];

    return res.json({
      trainNumber: row.trainNumber,
      status: row.status,
      currentStation: row.currentStationName
        ? { name: row.currentStationName, code: row.currentStationCode, sequence: row.currentStationSequence }
        : null,
      nextStation: row.nextStationName
        ? { name: row.nextStationName, code: row.nextStationCode, sequence: row.nextStationSequence }
        : null,
      lastUpdated: row.lastLocationUpdate,
    });
  } catch (err) {
    console.error('Get location error:', err);
    return res.status(500).json({ error: 'Something went wrong fetching train location' });
  }
}

/**
 * GET /api/trains/:trainId/status
 */
async function getStatus(req, res) {
  try {
    const trainId = parseInt(req.params.trainId, 10);

    const result = await db.query(
      `SELECT t."trainNumber", t.status, cur.name AS "currentStationName", next.name AS "nextStationName"
       FROM "Train" t
       LEFT JOIN "Station" cur ON cur.id = t."currentStationId"
       LEFT JOIN "Station" next ON next.id = t."nextStationId"
       WHERE t.id = $1`,
      [trainId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }

    const row = result.rows[0];
    return res.json({
      trainNumber: row.trainNumber,
      status: row.status,
      currentStation: row.currentStationName || null,
      nextStation: row.nextStationName || null,
    });
  } catch (err) {
    console.error('Get status error:', err);
    return res.status(500).json({ error: 'Something went wrong fetching train status' });
  }
}

/**
 * POST /api/trains/:trainId/simulate/next
 * Manually advances the train to the next station (for easy Postman testing).
 */
async function simulateNext(req, res) {
  try {
    const trainId = parseInt(req.params.trainId, 10);
    const trainSimulationService = require('../services/trainSimulationService');
    const updated = await trainSimulationService.advanceTrain(trainId);

    if (updated.error) {
      return res.status(400).json({ error: updated.error });
    }

    return res.json(updated);
  } catch (err) {
    console.error('Simulate next error:', err);
    return res.status(500).json({ error: 'Something went wrong advancing the train' });
  }
}

module.exports = {
  createTrain,
  searchTrains,
  getAvailability,
  getLocation,
  getStatus,
  simulateNext,
};
