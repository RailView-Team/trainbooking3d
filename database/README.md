# Database handoff

This folder contains the PostgreSQL schema, the reduced train dataset, and repeatable seed scripts.

## Setup

1. Create a database named `railseat`.
2. Copy `.env.example` to `.env` and set the PostgreSQL password.
3. Install the script dependencies:

```bash
pip install psycopg2-binary python-dotenv
```

4. Apply `schema.sql` in pgAdmin or with `psql`.
5. Run the imports from `database/scripts` (the scripts resolve paths relative to this folder):

```bash
python scripts/import_stations.py
python scripts/import_trains.py
python scripts/import_schedules.py
python scripts/seed_inventory.py
```

All imports are safe to re-run. Schedule rows are rebuilt per train so the route sequence stays deterministic. A station may appear more than once on a route; `train_stations` therefore has no unique constraint on `(train_id, station_id)`.

## Availability contract for the backend

Call the database function below for a seat map:

```sql
SELECT * FROM available_seats('11038', DATE '2026-10-01', 'GKP', 'PUNE');
```

The function returns `seat_id`, coach details, and seat details. It excludes a seat only when an active booking on the same train and date has:

```text
existing_from_sequence < requested_to_sequence
AND existing_to_sequence > requested_from_sequence
```

Therefore `A→B` and `B→D` can use the same seat. Cancelled bookings do not block seats.

## Booking transaction

The backend should perform availability validation and the insert in one transaction. For concurrent booking requests, lock the train for that journey date before checking availability:

```sql
SELECT pg_advisory_xact_lock(
    hashtextextended('train:' || :train_id || ':date:' || :journey_date, 0)
);
```

Then validate that source comes before destination in `train_stations`, call `available_seats`, and insert `bookings` plus `seat_bookings`. The application should return a conflict if the selected `seat_id` is no longer available.

## Important dataset notes

- `arrival` or `departure` equal to the string `None` is stored as SQL `NULL`.
- Technical halts remain in `train_stations` because they are needed for route ordering.
- Coach and seat inventory is synthetic because the source dataset has no inventory.
- Passwords must be hashed by the backend; the database stores only `password_hash`.
