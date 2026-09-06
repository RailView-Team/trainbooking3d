-- Train seat booking database
-- PostgreSQL 14+. Safe to run on a new database.

CREATE TABLE IF NOT EXISTS stations (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6)
);

-- Compatibility for the earlier draft schema if it has already been applied.
ALTER TABLE stations ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

CREATE TABLE IF NOT EXISTS trains (
    id BIGSERIAL PRIMARY KEY,
    train_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    train_type VARCHAR(30),
    distance INTEGER CHECK (distance IS NULL OR distance >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE trains ADD COLUMN IF NOT EXISTS train_type VARCHAR(30);
ALTER TABLE trains ADD COLUMN IF NOT EXISTS distance INTEGER;
ALTER TABLE trains ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS train_stations (
    id BIGSERIAL PRIMARY KEY,
    train_id BIGINT NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    station_id BIGINT NOT NULL REFERENCES stations(id),
    sequence INTEGER NOT NULL CHECK (sequence >= 1),
    day SMALLINT NOT NULL DEFAULT 1 CHECK (day >= 1),
    arrival TIME,
    departure TIME,
    UNIQUE (train_id, sequence)
);

-- The first draft schema added this constraint, but it is incorrect for routes
-- that pass through the same station code more than once.
ALTER TABLE train_stations
    DROP CONSTRAINT IF EXISTS train_stations_train_id_station_id_key;

CREATE TABLE IF NOT EXISTS coaches (
    id BIGSERIAL PRIMARY KEY,
    train_id BIGINT NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    coach_number VARCHAR(10) NOT NULL,
    coach_type VARCHAR(30) NOT NULL,
    UNIQUE (train_id, coach_number)
);

CREATE TABLE IF NOT EXISTS seats (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    seat_type VARCHAR(20),
    UNIQUE (coach_id, seat_number)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    pnr VARCHAR(20) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    train_id BIGINT NOT NULL REFERENCES trains(id),
    journey_date DATE NOT NULL,
    source_station_id BIGINT NOT NULL REFERENCES stations(id),
    destination_station_id BIGINT NOT NULL REFERENCES stations(id),
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
        CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    total_amount NUMERIC(10,2) CHECK (total_amount IS NULL OR total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (source_station_id <> destination_station_id)
);

CREATE TABLE IF NOT EXISTS seat_bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id BIGINT NOT NULL REFERENCES seats(id),
    from_station_id BIGINT NOT NULL REFERENCES stations(id),
    to_station_id BIGINT NOT NULL REFERENCES stations(id),
    CHECK (from_station_id <> to_station_id),
    UNIQUE (booking_id, seat_id, from_station_id, to_station_id)
);

-- The route sequence is the source of truth for overlap. Do not compare station IDs.
CREATE INDEX IF NOT EXISTS idx_train_stations_lookup
    ON train_stations (train_id, station_id, sequence);
CREATE INDEX IF NOT EXISTS idx_train_stations_route
    ON train_stations (train_id, sequence);
CREATE INDEX IF NOT EXISTS idx_coaches_train ON coaches (train_id);
CREATE INDEX IF NOT EXISTS idx_seats_coach ON seats (coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_train_date
    ON bookings (train_id, journey_date) WHERE status <> 'CANCELLED';
CREATE INDEX IF NOT EXISTS idx_seat_bookings_seat_booking
    ON seat_bookings (seat_id, booking_id);

-- Returns every seat that is free for the requested train/date/segment.
-- Touching segments are allowed: existing_from < requested_to AND existing_to > requested_from.
CREATE OR REPLACE FUNCTION available_seats(
    p_train_number VARCHAR,
    p_journey_date DATE,
    p_from_code VARCHAR,
    p_to_code VARCHAR
)
RETURNS TABLE (
    seat_id BIGINT,
    coach_number VARCHAR,
    coach_type VARCHAR,
    seat_number VARCHAR,
    seat_type VARCHAR
)
LANGUAGE SQL
STABLE
AS $$
WITH requested AS (
    SELECT ts_from.train_id, ts_from.sequence AS from_sequence,
           ts_to.sequence AS to_sequence
    FROM trains t
    JOIN train_stations ts_from ON ts_from.train_id = t.id
    JOIN stations s_from ON s_from.id = ts_from.station_id
    JOIN train_stations ts_to ON ts_to.train_id = t.id
    JOIN stations s_to ON s_to.id = ts_to.station_id
    WHERE t.train_number = p_train_number
      AND s_from.code = p_from_code
      AND s_to.code = p_to_code
      AND ts_from.sequence < ts_to.sequence
    LIMIT 1
), all_seats AS (
    SELECT s.id AS seat_id, c.coach_number, c.coach_type,
           s.seat_number, s.seat_type
    FROM requested r
    JOIN coaches c ON c.train_id = r.train_id
    JOIN seats s ON s.coach_id = c.id
)
SELECT a.*
FROM all_seats a
WHERE NOT EXISTS (
    SELECT 1
    FROM seat_bookings sb
    JOIN bookings b ON b.id = sb.booking_id
    JOIN train_stations existing_from
      ON existing_from.train_id = b.train_id
     AND existing_from.station_id = sb.from_station_id
    JOIN train_stations existing_to
      ON existing_to.train_id = b.train_id
     AND existing_to.station_id = sb.to_station_id
    CROSS JOIN requested r
    WHERE sb.seat_id = a.seat_id
      AND b.train_id = r.train_id
      AND b.journey_date = p_journey_date
      AND b.status <> 'CANCELLED'
      AND existing_from.sequence < r.to_sequence
      AND existing_to.sequence > r.from_sequence
);
$$;

COMMENT ON FUNCTION available_seats IS
    'Segment-aware availability. Call inside a transaction before inserting a booking.';
