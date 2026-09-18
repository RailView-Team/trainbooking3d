-- ============================================
-- STATIONS
-- ============================================

INSERT INTO stations
(name, city, code)
VALUES
('Howrah Junction', 'Kolkata', 'HWH'),
('Dhanbad Junction', 'Dhanbad', 'DHN'),
('Kolkata', 'Kolkata', 'KOAA'),
('New Delhi', 'New Delhi', 'NDLS'),
('Sealdah', 'Kolkata', 'SDAH'),
('Asansol Junction', 'Asansol', 'ASN'),
('Barddhaman Junction', 'Bardhaman', 'BWN'),
('Patna Junction', 'Patna', 'PNBE');


-- ============================================
-- TRAINS
-- ============================================

INSERT INTO trains
(train_number, name, status, amenities)
VALUES
(
    '104',
    'AeroExpress 104',
    'ON_TIME',
    '["WiFi", "Charging", "Food"]'
),
(
    '209',
    'Regional Rail 209',
    'ON_TIME',
    '["Charging", "Food"]'
),
(
    '055',
    'AeroRail Direct 055',
    'ON_TIME',
    '["WiFi", "Charging"]'
),
(
    '312',
    'Night Rider 312',
    'ON_TIME',
    '["Charging", "Blanket", "Food"]'
);


-- ============================================
-- HWH -> DHN TRIPS
-- ============================================

INSERT INTO train_trips
(
    train_id,
    from_station_id,
    to_station_id,
    departure_time,
    arrival_time,
    duration_minutes,
    stops
)
VALUES

(
    1,
    (SELECT id FROM stations WHERE code='HWH'),
    (SELECT id FROM stations WHERE code='DHN'),
    '08:30',
    '11:15',
    165,
    2
),

(
    2,
    (SELECT id FROM stations WHERE code='HWH'),
    (SELECT id FROM stations WHERE code='DHN'),
    '10:00',
    '13:30',
    210,
    5
),

(
    3,
    (SELECT id FROM stations WHERE code='HWH'),
    (SELECT id FROM stations WHERE code='DHN'),
    '14:15',
    '16:30',
    135,
    0
),

(
    4,
    (SELECT id FROM stations WHERE code='HWH'),
    (SELECT id FROM stations WHERE code='DHN'),
    '20:00',
    '23:45',
    225,
    6
);


-- ============================================
-- COACHES
-- ============================================

-- Train 1

INSERT INTO coaches
(train_id, code, class_code, class_name, fare, capacity)
VALUES
(1, 'S1', 'SL', 'Sleeper Class', 850, 72),
(1, 'A1', '3A', 'AC 3 Tier', 1450, 64),
(1, 'A2', '2A', 'AC 2 Tier', 2050, 46),
(1, 'H1', '1A', 'First AC', 3400, 24),
(1, 'C1', 'CC', 'AC Chair Car', 1100, 78);


-- Train 2

INSERT INTO coaches
(train_id, code, class_code, class_name, fare, capacity)
VALUES
(2, 'S1', 'SL', 'Sleeper Class', 850, 72),
(2, 'S2', 'SL', 'Sleeper Class', 850, 72),
(2, 'A1', '3A', 'AC 3 Tier', 1450, 64),
(2, 'A2', '3A', 'AC 3 Tier', 1450, 64),
(2, 'H1', '1A', 'First AC', 3400, 24);


-- Train 3

INSERT INTO coaches
(train_id, code, class_code, class_name, fare, capacity)
VALUES
(3, 'S1', 'SL', 'Sleeper Class', 850, 72),
(3, 'A1', '3A', 'AC 3 Tier', 1450, 64),
(3, 'C1', 'CC', 'AC Chair Car', 1100, 78);


-- Train 4

INSERT INTO coaches
(train_id, code, class_code, class_name, fare, capacity)
VALUES
(4, 'S1', 'SL', 'Sleeper Class', 850, 72),
(4, 'S2', 'SL', 'Sleeper Class', 850, 72),
(4, 'A1', '3A', 'AC 3 Tier', 1450, 64),
(4, 'A2', '3A', 'AC 3 Tier', 1450, 64),
(4, 'B1', '2A', 'AC 2 Tier', 2050, 46);


-- ============================================
-- GENERATE SEATS
-- ============================================

DO $$
DECLARE
    coach RECORD;
    i INTEGER;
    berth VARCHAR(30);
BEGIN

    FOR coach IN
        SELECT id, capacity, class_code
        FROM coaches
    LOOP

        FOR i IN 1..coach.capacity
        LOOP

            IF coach.class_code IN ('SL', '3A', '2A', '1A') THEN

                CASE ((i - 1) % 6)

                    WHEN 0 THEN berth := 'LOWER';
                    WHEN 1 THEN berth := 'MIDDLE';
                    WHEN 2 THEN berth := 'UPPER';
                    WHEN 3 THEN berth := 'LOWER';
                    WHEN 4 THEN berth := 'SIDE_LOWER';
                    WHEN 5 THEN berth := 'SIDE_UPPER';

                END CASE;

            ELSE

                berth := 'SEAT';

            END IF;


            INSERT INTO seats
            (
                coach_id,
                seat_number,
                berth_type
            )
            VALUES
            (
                coach.id,
                i::VARCHAR,
                berth
            );

        END LOOP;

    END LOOP;

END $$;