import json
from pathlib import Path

import psycopg2


# ==========================================
# PATH
# ==========================================

BASE_DIR = Path(__file__).resolve().parents[1]

JSON_FILE = BASE_DIR / "train" / "stations.json"


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "railseat"
DB_USER = "postgres"
DB_PASSWORD = "2005"


# ==========================================
# CONNECT TO POSTGRESQL
# ==========================================

connection = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)

cursor = connection.cursor()

print("Connected to PostgreSQL")


# ==========================================
# READ JSON
# ==========================================

with open(JSON_FILE, "r", encoding="utf-8") as file:
    data = json.load(file)

features = data["features"]

print(f"Stations found: {len(features)}")


# ==========================================
# INSERT STATIONS
# ==========================================

inserted = 0
skipped = 0

for feature in features:

    properties = feature.get("properties", {})

    code = properties.get("code")
    name = properties.get("name")
    state = properties.get("state")
    zone = properties.get("zone")

    # Skip invalid records
    if not code or not name:
        skipped += 1
        continue

    cursor.execute(
        """
        INSERT INTO stations
            (code, name, state, zone)
        VALUES
            (%s, %s, %s, %s)
        ON CONFLICT (code) DO NOTHING
        """,
        (code, name, state, zone)
    )

    if cursor.rowcount == 1:
        inserted += 1
    else:
        skipped += 1


# ==========================================
# SAVE
# ==========================================

connection.commit()


# ==========================================
# CLOSE
# ==========================================

cursor.close()
connection.close()


print("--------------------------------")
print("Import completed")
print(f"Inserted: {inserted}")
print(f"Skipped:  {skipped}")
print("--------------------------------")