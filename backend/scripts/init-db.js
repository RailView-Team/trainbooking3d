import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

const directory = path.dirname(fileURLToPath(import.meta.url))
const schema = await fs.readFile(path.join(directory, '..', 'database', 'schema.sql'), 'utf8')
const seed = await fs.readFile(path.join(directory, '..', 'database', 'seed.sql'), 'utf8')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined })

try {
  await pool.query(schema)
  await pool.query(seed)
  console.log('Database schema and seed data initialized.')
} finally {
  await pool.end()
}
