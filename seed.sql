-- Database: aerorail (Create this in psql or pgAdmin first)

CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS trains (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    source_station_code VARCHAR(10) REFERENCES stations(code),
    destination_station_code VARCHAR(10) REFERENCES stations(code)
);

CREATE TABLE IF NOT EXISTS coaches (
    id SERIAL PRIMARY KEY,
    train_id INTEGER REFERENCES trains(id),
    name VARCHAR(10) NOT NULL,
    class VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id),
    seat_number VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    train_id INTEGER REFERENCES trains(id),
    journey_date DATE NOT NULL,
    seat_id INTEGER REFERENCES seats(id),
    passenger_name VARCHAR(255) NOT NULL,
    UNIQUE(journey_date, seat_id)
);

-- Dummy Data
INSERT INTO stations (name, code) VALUES 
('Howrah', 'HWH'),
('Dhanbad', 'DHN'),
('New Delhi', 'NDLS')
ON CONFLICT (code) DO NOTHING;

INSERT INTO trains (id, train_number, name, source_station_code, destination_station_code) VALUES
(1, '12381', 'Poorva Express', 'HWH', 'NDLS'),
(2, '12019', 'Shatabdi Express', 'HWH', 'DHN')
ON CONFLICT DO NOTHING;

-- Let's assume train with ID 2 is Shatabdi Express (HWH to DHN)
INSERT INTO coaches (id, train_id, name, class) VALUES
(1, 2, 'C1', 'CC'),
(2, 2, 'E1', 'EC')
ON CONFLICT DO NOTHING;

-- Insert some seats for C1
INSERT INTO seats (coach_id, seat_number) VALUES
(1, '1'), (1, '2'), (1, '3'), (1, '4'), (1, '5'), (1, '6'), (1, '7'), (1, '8');

-- Insert some seats for E1
INSERT INTO seats (coach_id, seat_number) VALUES
(2, '1'), (2, '2'), (2, '3'), (2, '4');
