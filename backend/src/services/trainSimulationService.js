const db = require('../db');

/**
 * TRAIN LOCATION SIMULATION
 * -------------------------
 * We don't use GPS or any external API. We simply store, per train:
 *   currentStationId / currentStationSequence
 *   nextStationId
 *   status (NOT_STARTED -> RUNNING -> ARRIVED -> ... -> COMPLETED)
 *   lastLocationUpdate
 *
 * A background timer (see startAutoAdvance) calls advanceTrain() for every
 * train periodically, moving each one step forward along its route.
 * advanceTrain() can also be called manually via POST /simulate/next.
 */

/**
 * Moves a single train to the next station on its route.
 * Returns the updated location info, or { error } if the train doesn't exist
 * or has already completed its journey.
 */
async function advanceTrain(trainId) {
  const trainResult = await db.query(
    `SELECT * FROM "Train" WHERE id = $1`,
    [trainId]
  );
  if (trainResult.rows.length === 0) {
    return { error: 'Train not found' };
  }
  const train = trainResult.rows[0];

  if (train.status === 'COMPLETED') {
    return { error: 'Train has already completed its journey' };
  }

  // Get the full route ordered by sequence
  const routeResult = await db.query(
    `SELECT ts.sequence, s.id AS "stationId", s.name, s.code
     FROM "TrainStation" ts
     JOIN "Station" s ON s.id = ts."stationId"
     WHERE ts."trainId" = $1
     ORDER BY ts.sequence ASC`,
    [trainId]
  );
  const route = routeResult.rows;

  if (route.length === 0) {
    return { error: 'This train has no route defined' };
  }

  const currentSequence = train.currentStationSequence;
  const currentIndex = route.findIndex((stop) => stop.sequence === currentSequence);

  // If the train hasn't started yet (no current station set), start at the first stop.
  const startingIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = startingIndex + 1;

  if (nextIndex >= route.length) {
    // Already at the last station -> mark journey COMPLETED
    await db.query(
      `UPDATE "Train"
       SET status = 'COMPLETED', "nextStationId" = NULL, "lastLocationUpdate" = NOW()
       WHERE id = $1`,
      [trainId]
    );
    return { trainId, status: 'COMPLETED', currentStation: route[route.length - 1].name, nextStation: null };
  }

  const newCurrent = route[nextIndex];
  const newNext = route[nextIndex + 1] || null;

  // Status logic: RUNNING while en route, ARRIVED momentarily at a station,
  // COMPLETED once we reach the final stop. For simplicity we mark it RUNNING
  // when there's a next stop ahead, and ARRIVED when it just reached the last stop.
  const newStatus = newNext ? 'RUNNING' : 'ARRIVED';

  await db.query(
    `UPDATE "Train"
     SET "currentStationId" = $1,
         "currentStationSequence" = $2,
         "nextStationId" = $3,
         status = $4,
         "lastLocationUpdate" = NOW()
     WHERE id = $5`,
    [newCurrent.stationId, newCurrent.sequence, newNext ? newNext.stationId : null, newStatus, trainId]
  );

  return {
    trainId,
    status: newStatus,
    currentStation: newCurrent.name,
    nextStation: newNext ? newNext.name : null,
  };
}

/**
 * Starts a background timer that advances every train (that hasn't completed
 * its journey) by one station on each tick. Interval is configurable via
 * TRAIN_LOCATION_INTERVAL in .env (milliseconds).
 */
function startAutoAdvance() {
  const intervalMs = parseInt(process.env.TRAIN_LOCATION_INTERVAL, 10) || 10000;

  setInterval(async () => {
    try {
      const result = await db.query(
        `SELECT id FROM "Train" WHERE status != 'COMPLETED'`
      );
      for (const row of result.rows) {
        await advanceTrain(row.id);
      }
    } catch (err) {
      console.error('Auto train-advance error:', err);
    }
  }, intervalMs);

  console.log(`Train location auto-advance started (every ${intervalMs}ms)`);
}

module.exports = { advanceTrain, startAutoAdvance };
