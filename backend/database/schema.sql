DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_seats CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS route_stops CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;
DROP TABLE IF EXISTS train_trips CASCADE;
DROP TABLE IF EXISTS trains CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ============================================
-- STATIONS
-- ============================================

CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    state VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- TRAINS
-- ============================================

CREATE TABLE trains (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    train_type VARCHAR(50) DEFAULT 'SUPERFAST',
    status VARCHAR(30) DEFAULT 'ON_TIME',
    amenities JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- TRAIN TRIPS
-- ============================================

CREATE TABLE train_trips (
    id SERIAL PRIMARY KEY,

    train_id INTEGER NOT NULL
        REFERENCES trains(id)
        ON DELETE CASCADE,

    from_station_id INTEGER NOT NULL
        REFERENCES stations(id),

    to_station_id INTEGER NOT NULL
        REFERENCES stations(id),

    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,

    duration_minutes INTEGER NOT NULL,

    stops INTEGER DEFAULT 0,

    runs_on VARCHAR(50) DEFAULT 'DAILY',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- ROUTE STOPS (INTERMEDIATE STATIONS & SCHEDULE)
-- ============================================

CREATE TABLE route_stops (
    id SERIAL PRIMARY KEY,

    trip_id INTEGER NOT NULL
        REFERENCES train_trips(id)
        ON DELETE CASCADE,

    station_id INTEGER NOT NULL
        REFERENCES stations(id),

    stop_sequence INTEGER NOT NULL,

    arrival_time TIME,
    departure_time TIME,

    halt_minutes INTEGER DEFAULT 2,

    distance_km INTEGER DEFAULT 0,

    platform VARCHAR(10),

    UNIQUE(trip_id, stop_sequence),
    UNIQUE(trip_id, station_id)
);


-- ============================================
-- COACHES
-- ============================================

CREATE TABLE coaches (
    id SERIAL PRIMARY KEY,

    train_id INTEGER NOT NULL
        REFERENCES trains(id)
        ON DELETE CASCADE,

    code VARCHAR(20) NOT NULL,

    class_code VARCHAR(10) NOT NULL,

    class_name VARCHAR(100) NOT NULL,

    fare DECIMAL(10,2) NOT NULL,

    capacity INTEGER NOT NULL,

    UNIQUE(train_id, code)
);


-- ============================================
-- SEATS
-- ============================================

CREATE TABLE seats (
    id SERIAL PRIMARY KEY,

    coach_id INTEGER NOT NULL
        REFERENCES coaches(id)
        ON DELETE CASCADE,

    seat_number VARCHAR(10) NOT NULL,

    berth_type VARCHAR(30),

    UNIQUE(coach_id, seat_number)
);


-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- BOOKINGS
-- ============================================

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,

    pnr VARCHAR(30) UNIQUE NOT NULL,

    user_id INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    trip_id INTEGER NOT NULL
        REFERENCES train_trips(id),

    coach_id INTEGER NOT NULL
        REFERENCES coaches(id),

    boarding_stop_id INTEGER
        REFERENCES route_stops(id),

    alighting_stop_id INTEGER
        REFERENCES route_stops(id),

    journey_date DATE NOT NULL,

    status VARCHAR(30) DEFAULT 'PENDING',

    payment_status VARCHAR(30) DEFAULT 'PENDING',

    total_amount DECIMAL(10,2) NOT NULL,

    contact_email VARCHAR(150),

    contact_phone VARCHAR(30),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- PASSENGERS
-- ============================================

CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,

    booking_id INTEGER NOT NULL
        REFERENCES bookings(id)
        ON DELETE CASCADE,

    seat_id INTEGER NOT NULL
        REFERENCES seats(id),

    name VARCHAR(100) NOT NULL,

    age INTEGER NOT NULL,

    gender VARCHAR(20) NOT NULL,

    berth_preference VARCHAR(30)
);


-- ============================================
-- BOOKING SEATS
-- ============================================

CREATE TABLE booking_seats (
    id SERIAL PRIMARY KEY,

    booking_id INTEGER NOT NULL
        REFERENCES bookings(id)
        ON DELETE CASCADE,

    seat_id INTEGER NOT NULL
        REFERENCES seats(id),

    UNIQUE(booking_id, seat_id)
);


-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,

    booking_id INTEGER UNIQUE NOT NULL
        REFERENCES bookings(id)
        ON DELETE CASCADE,

    amount DECIMAL(10,2) NOT NULL,

    status VARCHAR(30) DEFAULT 'PENDING',

    method VARCHAR(50),

    transaction_id VARCHAR(100) UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_train_trips_route
ON train_trips(from_station_id, to_station_id);

CREATE INDEX idx_train_trips_train
ON train_trips(train_id);

CREATE INDEX idx_route_stops_trip
ON route_stops(trip_id, stop_sequence);

CREATE INDEX idx_route_stops_station
ON route_stops(station_id);

CREATE INDEX idx_coaches_train
ON coaches(train_id);

CREATE INDEX idx_seats_coach
ON seats(coach_id);

CREATE INDEX idx_bookings_user
ON bookings(user_id);

CREATE INDEX idx_bookings_trip_date
ON bookings(trip_id, journey_date);

CREATE INDEX idx_bookings_coach
ON bookings(coach_id);

CREATE INDEX idx_booking_seats_seat
ON booking_seats(seat_id);