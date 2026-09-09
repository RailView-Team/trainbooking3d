import json
from collections import defaultdict

from db import BASE_DIR, connect, parse_time


def main():
    rows = json.loads((BASE_DIR / "train" / "schedules.json").read_text(encoding="utf-8"))
    by_train = defaultdict(list)
    for input_order, row in enumerate(rows):
        if row.get("train_number") and row.get("station_code"):
            by_train[str(row["train_number"])].append((input_order, row))

    route_rows = 0
    with connect() as connection, connection.cursor() as cursor:
        for train_number, train_rows in by_train.items():
            cursor.execute("SELECT id FROM trains WHERE train_number = %s", (train_number,))
            train = cursor.fetchone()
            if not train:
                raise ValueError(f"Schedule references unknown train {train_number}")
            train_id = train[0]

            # Dataset IDs preserve route order while schedules for different trains are interleaved.
            ordered = sorted(train_rows, key=lambda item: (item[1].get("day") or 1, item[1].get("id", item[0])))
            cursor.execute("DELETE FROM train_stations WHERE train_id = %s", (train_id,))
            for sequence, (_, row) in enumerate(ordered, start=1):
                code = row["station_code"]
                cursor.execute("SELECT id FROM stations WHERE code = %s", (code,))
                station = cursor.fetchone()
                if not station:
                    cursor.execute(
                        """
                        INSERT INTO stations (code, name) VALUES (%s, %s)
                        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
                        RETURNING id
                        """, (code, row.get("station_name") or code),
                    )
                    station = cursor.fetchone()
                cursor.execute(
                    """
                    INSERT INTO train_stations
                        (train_id, station_id, sequence, day, arrival, departure)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (train_id, station[0], sequence, row.get("day") or 1,
                     parse_time(row.get("arrival")), parse_time(row.get("departure"))),
                )
                route_rows += 1
    print(f"Routes imported: {len(by_train)} trains / {route_rows} stops")


if __name__ == "__main__":
    main()
