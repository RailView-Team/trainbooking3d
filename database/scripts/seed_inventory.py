import argparse

from db import connect


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic coaches and seats for every train.")
    parser.add_argument("--coaches-per-train", type=int, default=5)
    parser.add_argument("--seats-per-coach", type=int, default=72)
    args = parser.parse_args()
    if args.coaches_per_train < 1 or args.seats_per_coach < 1:
        parser.error("coach and seat counts must be positive")

    created_coaches = created_seats = 0
    with connect() as connection, connection.cursor() as cursor:
        cursor.execute("SELECT id FROM trains WHERE active ORDER BY train_number")
        trains = cursor.fetchall()
        for (train_id,) in trains:
            for coach_index in range(1, args.coaches_per_train + 1):
                coach_number = f"{coach_index:02d}"
                cursor.execute(
                    """
                    INSERT INTO coaches (train_id, coach_number, coach_type)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (train_id, coach_number) DO UPDATE
                        SET coach_type = EXCLUDED.coach_type
                    RETURNING id
                    """, (train_id, coach_number, "SLEEPER"),
                )
                coach_id = cursor.fetchone()[0]
                created_coaches += cursor.rowcount
                for seat_index in range(1, args.seats_per_coach + 1):
                    cursor.execute(
                        """
                        INSERT INTO seats (coach_id, seat_number, seat_type)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (coach_id, seat_number) DO NOTHING
                        """, (coach_id, str(seat_index), "BERTH"),
                    )
                    created_seats += cursor.rowcount
    print(f"Coaches processed: {len(trains) * args.coaches_per_train}; new seats: {created_seats}")


if __name__ == "__main__":
    main()
