import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../src/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log("🔌 Connecting to database...");
    const client = await pool.connect();

    try {
        console.log("📄 Reading schema.sql...");
        const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
        
        console.log("🚀 Executing schema.sql...");
        await client.query(schemaSql);
        console.log("✅ Schema created successfully.");

        console.log("📄 Reading seed.sql...");
        const seedSql = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf-8");

        console.log("🌱 Executing seed.sql...");
        await client.query(seedSql);
        console.log("✅ Seed data inserted successfully.");

        console.log("🎉 Database initialization completed successfully!");
    } catch (err) {
        console.error("❌ Database initialization failed:", err);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

run();
