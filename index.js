const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. GET /api/stations
app.get('/api/stations', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, code FROM stations');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// 2. GET /api/trains/search?from=HWH&to=DHN
app.get('/api/trains/search', async (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing from or to parameters' });
  }

  try {
    const query = `
      SELECT id as "trainId", train_number as "trainNumber", name, source_station_code as "from", destination_station_code as "to"
      FROM trains
      WHERE source_station_code = $1 AND destination_station_code = $2
    `;
    const result = await db.query(query, [from, to]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching trains:', error);
    res.status(500).json({ error: 'Failed to search trains' });
  }
});

// 3. GET /api/trains/:trainId/availability?from=HWH&to=DHN&date=YYYY-MM-DD
app.get('/api/trains/:trainId/availability', async (req, res) => {
  const { trainId } = req.params;
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ error: 'Missing from, to, or date parameters' });
  }

  try {
    // Basic verification of train
    const trainResult = await db.query('SELECT * FROM trains WHERE id = $1', [trainId]);
    if (trainResult.rows.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }
    const train = trainResult.rows[0];

    // Get coaches
    const coachesResult = await db.query('SELECT id, name, class FROM coaches WHERE train_id = $1', [trainId]);
    const coaches = coachesResult.rows;

    // Get seats and availability
    const availabilityData = [];
    for (const coach of coaches) {
      const seatsResult = await db.query(`
        SELECT 
          s.id, 
          s.seat_number, 
          COALESCE(b.id IS NOT NULL, false) as is_booked
        FROM seats s
        LEFT JOIN bookings b ON s.id = b.seat_id AND b.journey_date = $2
        WHERE s.coach_id = $1
      `, [coach.id, date]);
      
      availabilityData.push({
        coach: { id: coach.id, name: coach.name, class: coach.class },
        seats: seatsResult.rows
      });
    }

    res.json({
      trainId: train.id,
      trainNumber: train.train_number,
      name: train.name,
      from,
      to,
      date,
      availability: availabilityData
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

app.listen(port, () => {
  console.log(`AeroRail backend running on port ${port}`);
});
