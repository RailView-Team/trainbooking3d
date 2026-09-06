import json

from db import BASE_DIR, connect


def main():
    data = json.loads((BASE_DIR / "train" / "stations.json").read_text(encoding="utf-8"))
    inserted = 0
    with connect() as connection, connection.cursor() as cursor:
        for feature in data.get("features", []):
            p = feature.get("properties", {})
            code, name = p.get("code"), p.get("name")
            if not code or not name:
                continue
            geometry = feature.get("geometry") or {}
            coordinates = geometry.get("coordinates") or [None, None]
            cursor.execute(
                """
                INSERT INTO stations (code, name, state, latitude, longitude)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (code) DO UPDATE SET
                    name = EXCLUDED.name,
                    state = COALESCE(EXCLUDED.state, stations.state),
                    latitude = COALESCE(EXCLUDED.latitude, stations.latitude),
                    longitude = COALESCE(EXCLUDED.longitude, stations.longitude)
                """,
                (code, name, p.get("state"), coordinates[1], coordinates[0]),
            )
            inserted += cursor.rowcount
    print(f"Stations processed: {inserted}")


if __name__ == "__main__":
    main()
