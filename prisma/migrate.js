/**
 * Applies prisma/migrations/001_init/migration.sql directly via `pg`.
 *
 * NOTE FOR REVIEWERS:
 * In a normal environment you would run `npx prisma migrate dev` and Prisma's
 * engine would do this for you. This sandbox cannot reach binaries.prisma.sh
 * (the host is blocked), so Prisma's CLI/engine cannot download and cannot run.
 * schema.prisma is still the source of truth for the data model; this script
 * just applies the equivalent hand-written SQL so the project actually runs
 * here. On a machine with normal internet access, `npx prisma migrate dev`
 * works directly against schema.prisma instead of this script.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const sqlPath = path.join(__dirname, 'migrations', '001_init', 'migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await client.query(sql);
    console.log('Migration applied successfully.');
  } catch (err) {
    if (err.code === '42P07') {
      console.log('Tables already exist, skipping migration.');
    } else {
      throw err;
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
