/**
 * Simple PostgreSQL connection pool.
 *
 * The data model is defined in prisma/schema.prisma (Prisma ORM), and in a
 * normal dev environment this project would use @prisma/client generated
 * from that schema. This sandbox blocks the host Prisma downloads its query
 * engine binary from, so we talk to Postgres directly via `pg` instead,
 * using plain parameterized SQL. See README.md for details.
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
