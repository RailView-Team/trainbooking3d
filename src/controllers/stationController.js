const db = require('../db');

async function createStation(req, res) {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'name and code are required' });
    }

    const existing = await db.query('SELECT id FROM "Station" WHERE code = $1', [code]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A station with this code already exists' });
    }

    const result = await db.query(
      `INSERT INTO "Station" (name, code) VALUES ($1, $2) RETURNING *`,
      [name, code.toUpperCase()]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create station error:', err);
    return res.status(500).json({ error: 'Something went wrong creating the station' });
  }
}

async function listStations(req, res) {
  try {
    const result = await db.query('SELECT * FROM "Station" ORDER BY name ASC');
    return res.json(result.rows);
  } catch (err) {
    console.error('List stations error:', err);
    return res.status(500).json({ error: 'Something went wrong fetching stations' });
  }
}

module.exports = { createStation, listStations };
