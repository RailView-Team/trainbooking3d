/**
 * Seeds the database with:
 * - 6 stations: HWH, BDC, DGR, ASN, DHN, GAYA
 * - 1 train: 12345 Howrah Delhi Express, with that route (sequence 0..5)
 * - 2 coaches (A1, A2), 10 seats each
 *
 * Run with: npm run prisma:seed
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const STATIONS = [
  { name: 'Howrah', code: 'HWH' },
  { name: 'Bardhaman', code: 'BDC' },
  { name: 'Durgapur', code: 'DGR' },
  { name: 'Asansol', code: 'ASN' },
  { name: 'Dhanbad', code: 'DHN' },
  { name: 'Gaya', code: 'GAYA' },
];

async function upsertStation(client, station) {
  const existing = await client.query('SELECT id FROM "Station" WHERE code = $1', [station.code]);
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }
  const result = await client.query(
    'INSERT INTO "Station" (name, code) VALUES ($1, $2) RETURNING id',
    [station.name, station.code]
  );
  return result.rows[0].id;
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding stations...');
    const stationIds = {};
    for (const station of STATIONS) {
      stationIds[station.code] = await upsertStation(client, station);
    }

    console.log('Seeding train 12345 Howrah Delhi Express...');
    const existingTrain = await client.query('SELECT id FROM "Train" WHERE "trainNumber" = $1', ['12345']);

    let trainId;
    if (existingTrain.rows.length > 0) {
      trainId = existingTrain.rows[0].id;
      console.log('Train 12345 already exists, skipping full re-seed. (Delete it manually to reseed from scratch.)');
      await client.query('COMMIT');
      return;
    }

    const trainResult = await client.query(
      `INSERT INTO "Train" ("trainNumber", "name", "status") VALUES ($1, $2, 'NOT_STARTED') RETURNING id`,
      ['12345', 'Howrah Delhi Express']
    );
    trainId = trainResult.rows[0].id;

    const route = [
      { code: 'HWH', sequence: 0, departureTime: '08:00' },
      { code: 'BDC', sequence: 1, arrivalTime: '09:30', departureTime: '09:35' },
      { code: 'DGR', sequence: 2, arrivalTime: '10:30', departureTime: '10:35' },
      { code: 'ASN', sequence: 3, arrivalTime: '11:15', departureTime: '11:20' },
      { code: 'DHN', sequence: 4, arrivalTime: '12:30', departureTime: '12:35' },
      { code: 'GAYA', sequence: 5, arrivalTime: '14:00' },
    ];

    for (const stop of route) {
      await client.query(
        `INSERT INTO "TrainStation" ("trainId", "stationId", "sequence", "arrivalTime", "departureTime")
         VALUES ($1, $2, $3, $4, $5)`,
        [trainId, stationIds[stop.code], stop.sequence, stop.arrivalTime || null, stop.departureTime || null]
      );
    }

    // Set initial location: at Howrah (sequence 0), next stop Bardhaman
    await client.query(
      `UPDATE "Train"
       SET "currentStationId" = $1, "currentStationSequence" = 0, "nextStationId" = $2, "lastLocationUpdate" = NOW()
       WHERE id = $3`,
      [stationIds['HWH'], stationIds['BDC'], trainId]
    );

    console.log('Seeding coaches and seats (2 coaches x 10 seats)...');
    const coaches = [
      { coachNumber: 'A1', classType: 'SLEEPER' },
      { coachNumber: 'A2', classType: 'SLEEPER' },
    ];

    for (const coach of coaches) {
      const coachResult = await client.query(
        `INSERT INTO "Coach" ("trainId", "coachNumber", "classType") VALUES ($1, $2, $3) RETURNING id`,
        [trainId, coach.coachNumber, coach.classType]
      );
      const coachId = coachResult.rows[0].id;

      for (let i = 1; i <= 10; i++) {
        const seatNumber = `${coach.coachNumber}-${String(i).padStart(2, '0')}`;
        await client.query(
          `INSERT INTO "Seat" ("coachId", "seatNumber", "seatType") VALUES ($1, $2, 'SLEEPER')`,
          [coachId, seatNumber]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Seed complete! Train ID:', trainId);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
