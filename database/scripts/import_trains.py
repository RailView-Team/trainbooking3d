import json

from db import BASE_DIR, connect


def main():
    data = json.loads((BASE_DIR / "train" / "trains.json").read_text(encoding="utf-8"))
    processed = 0
    with connect() as connection, connection.cursor() as cursor:
        for feature in data.get("features", []):
            p = feature.get("properties", {})
            number, name = p.get("number"), p.get("name")
            if not number or not name:
                continue
            cursor.execute(
                """
                INSERT INTO trains (train_number, name, train_type, distance)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (train_number) DO UPDATE SET
                    name = EXCLUDED.name,
                    train_type = EXCLUDED.train_type,
                    distance = EXCLUDED.distance
                """,
                (str(number), name, p.get("type"), p.get("distance")),
            )
            processed += 1
    print(f"Trains processed: {processed}")


if __name__ == "__main__":
    main()
