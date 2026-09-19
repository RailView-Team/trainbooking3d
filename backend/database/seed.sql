-- ==========================================================
-- RAILVIEW SEED DATA (AUTHENTIC INDIAN RAILWAYS NETWORK)
-- ==========================================================

-- 1. STATIONS (42 Major Indian Railway Junctions & Terminals)
INSERT INTO stations (name, city, code, state, latitude, longitude) VALUES
('Howrah Junction', 'Kolkata', 'HWH', 'West Bengal', 22.5839, 88.3426),
('Sealdah', 'Kolkata', 'SDAH', 'West Bengal', 22.5670, 88.3711),
('Kolkata Railway Station', 'Kolkata', 'KOAA', 'West Bengal', 22.6022, 88.3764),
('Barddhaman Junction', 'Bardhaman', 'BWN', 'West Bengal', 23.2324, 87.8615),
('Durgapur', 'Durgapur', 'DGR', 'West Bengal', 23.4988, 87.3119),
('Asansol Junction', 'Asansol', 'ASN', 'West Bengal', 23.6871, 86.9746),
('Dhanbad Junction', 'Dhanbad', 'DHN', 'Jharkhand', 23.7917, 86.4304),
('Bokaro Steel City', 'Bokaro', 'BKSC', 'Jharkhand', 23.6267, 86.1558),
('Ranchi Junction', 'Ranchi', 'RNC', 'Jharkhand', 23.3441, 85.3240),
('Gaya Junction', 'Gaya', 'GAYA', 'Bihar', 24.8021, 84.9994),
('Patna Junction', 'Patna', 'PNBE', 'Bihar', 25.6022, 85.1376),
('Pt. Deen Dayal Upadhyaya Junction', 'Mughalsarai', 'DDU', 'Uttar Pradesh', 25.2818, 83.1189),
('Varanasi Junction', 'Varanasi', 'BSB', 'Uttar Pradesh', 25.3283, 82.9863),
('Prayagraj Junction', 'Prayagraj', 'PRYJ', 'Uttar Pradesh', 25.4484, 81.8340),
('Kanpur Central', 'Kanpur', 'CNB', 'Uttar Pradesh', 26.4547, 80.3507),
('Lucknow Charbagh', 'Lucknow', 'LKO', 'Uttar Pradesh', 26.8322, 80.9221),
('Agra Cantt', 'Agra', 'AGC', 'Uttar Pradesh', 27.1592, 78.0069),
('New Delhi', 'New Delhi', 'NDLS', 'Delhi', 28.6431, 77.2197),
('Delhi Junction (Old Delhi)', 'Delhi', 'DLI', 'Delhi', 28.6609, 77.2274),
('Hazrat Nizamuddin', 'Delhi', 'NZM', 'Delhi', 28.5888, 77.2534),
('Jaipur Junction', 'Jaipur', 'JP', 'Rajasthan', 26.9196, 75.7878),
('Kota Junction', 'Kota', 'KOTA', 'Rajasthan', 25.2138, 75.8648),
('Ratlam Junction', 'Ratlam', 'RTM', 'Madhya Pradesh', 23.3364, 75.0373),
('Bhopal Junction', 'Bhopal', 'BPL', 'Madhya Pradesh', 23.2678, 77.4126),
('Gwalior Junction', 'Gwalior', 'GWL', 'Madhya Pradesh', 26.2183, 78.1828),
('Nagpur Junction', 'Nagpur', 'NGP', 'Maharashtra', 21.1524, 79.0888),
('Pune Junction', 'Pune', 'PUNE', 'Maharashtra', 18.5289, 73.8744),
('Surat', 'Surat', 'ST', 'Gujarat', 21.2052, 72.8407),
('Vadodara Junction', 'Vadodara', 'BRC', 'Gujarat', 22.3107, 73.1812),
('Ahmedabad Junction', 'Ahmedabad', 'ADI', 'Gujarat', 23.0276, 72.6012),
('Mumbai Central', 'Mumbai', 'MMCT', 'Maharashtra', 18.9696, 72.8193),
('Chhatrapati Shivaji Maharaj Terminus', 'Mumbai', 'CSMT', 'Maharashtra', 18.9401, 72.8353),
('Bandra Terminus', 'Mumbai', 'BDTS', 'Maharashtra', 19.0607, 72.8407),
('Kharagpur Junction', 'Kharagpur', 'KGP', 'West Bengal', 22.3396, 87.3256),
('Bhubaneswar', 'Bhubaneswar', 'BBS', 'Odisha', 20.2668, 85.8436),
('Puri', 'Puri', 'PURI', 'Odisha', 19.8135, 85.8312),
('Visakhapatnam Junction', 'Visakhapatnam', 'VSKP', 'Andhra Pradesh', 17.7215, 83.2872),
('Vijayawada Junction', 'Vijayawada', 'BZA', 'Andhra Pradesh', 16.5175, 80.6200),
('Chennai Central', 'Chennai', 'MAS', 'Tamil Nadu', 13.0827, 80.2707),
('KSR Bengaluru City', 'Bengaluru', 'SBC', 'Karnataka', 12.9781, 77.5695),
('Hyderabad Deccan', 'Hyderabad', 'HYB', 'Telangana', 17.3924, 78.4682),
('Secunderabad Junction', 'Hyderabad', 'SC', 'Telangana', 17.4334, 78.5046);


-- 2. TRAINS (Popular Indian Flagship & Superfast Trains)
INSERT INTO trains (id, train_number, name, train_type, status, amenities) VALUES
(1, '22436', 'Vande Bharat Express', 'VANDE_BHARAT', 'ON_TIME', '["High Speed WiFi", "CCTV", "180° Rotating Seats", "Infotainment", "Pantry Meals", "USB Fast Charging"]'),
(2, '12301', 'Howrah - New Delhi Rajdhani Express', 'RAJDHANI', 'ON_TIME', '["Bedding & Linen", "Complimentary Gourmet Meals", "High Speed WiFi", "First Aid", "Reading Light"]'),
(3, '12019', 'Howrah - Ranchi Shatabdi Express', 'SHATABDI', 'ON_TIME', '["Breakfast & Snacks", "Newspaper", "Executive Chair", "Large View Windows", "AC"]'),
(4, '12951', 'Mumbai Tejas Rajdhani Express', 'RAJDHANI', 'ON_TIME', '["Smart Windows", "WiFi", "Automatic Doors", "Bio-vacuum Toilets", "Gourmet Catering"]'),
(5, '12009', 'Mumbai - Ahmedabad Shatabdi Express', 'SHATABDI', 'ON_TIME', '["Executive Chair", "AC Chair Car", "Hot Meals", "Wide Vista Windows"]'),
(6, '12313', 'Sealdah - New Delhi Rajdhani Express', 'RAJDHANI', 'ON_TIME', '["Bedding & Linen", "Gourmet Meals", "Charging Ports", "Quiet Coach"]'),
(7, '20607', 'MGR Chennai - Mysuru Vande Bharat', 'VANDE_BHARAT', 'ON_TIME', '["Kavach Safety", "GPS Info Screens", "Bio-toilets", "Rotatable Executive Seats"]'),
(8, '12841', 'Coromandel Express', 'SUPERFAST', 'ON_TIME', '["Pantry Car", "Charging Sockets", "Sleeper & AC Coaches", "Bedding in AC"]');

SELECT setval('trains_id_seq', (SELECT MAX(id) FROM trains));


-- 3. TRAIN TRIPS (Primary Routes + Reverse Routes)
INSERT INTO train_trips (id, train_id, from_station_id, to_station_id, departure_time, arrival_time, duration_minutes, stops, runs_on) VALUES
-- Trip 1: Vande Bharat NDLS -> BSB
(1, 1, (SELECT id FROM stations WHERE code='NDLS'), (SELECT id FROM stations WHERE code='BSB'), '06:00', '14:00', 480, 2, 'EXCEPT_THU'),
-- Trip 2: Vande Bharat BSB -> NDLS (Reverse)
(2, 1, (SELECT id FROM stations WHERE code='BSB'), (SELECT id FROM stations WHERE code='NDLS'), '15:00', '23:00', 480, 2, 'EXCEPT_THU'),
-- Trip 3: HWH Rajdhani HWH -> NDLS
(3, 2, (SELECT id FROM stations WHERE code='HWH'), (SELECT id FROM stations WHERE code='NDLS'), '16:50', '10:05', 1035, 6, 'DAILY'),
-- Trip 4: HWH Rajdhani NDLS -> HWH (Reverse)
(4, 2, (SELECT id FROM stations WHERE code='NDLS'), (SELECT id FROM stations WHERE code='HWH'), '16:55', '09:55', 1020, 6, 'DAILY'),
-- Trip 5: HWH Shatabdi HWH -> RNC
(5, 3, (SELECT id FROM stations WHERE code='HWH'), (SELECT id FROM stations WHERE code='RNC'), '06:05', '13:15', 430, 5, 'EXCEPT_SUN'),
-- Trip 6: Mumbai Tejas Rajdhani MMCT -> NDLS
(6, 4, (SELECT id FROM stations WHERE code='MMCT'), (SELECT id FROM stations WHERE code='NDLS'), '17:00', '08:32', 932, 5, 'DAILY'),
-- Trip 7: Mumbai-Ahmedabad Shatabdi MMCT -> ADI
(7, 5, (SELECT id FROM stations WHERE code='MMCT'), (SELECT id FROM stations WHERE code='ADI'), '06:20', '12:45', 385, 4, 'EXCEPT_SUN'),
-- Trip 8: Coromandel Express HWH -> MAS
(8, 8, (SELECT id FROM stations WHERE code='HWH'), (SELECT id FROM stations WHERE code='MAS'), '15:30', '17:00', 1530, 14, 'DAILY');

SELECT setval('train_trips_id_seq', (SELECT MAX(id) FROM train_trips));


-- 4. ROUTE STOPS (Complete Intermediate Stations & Timings)
-- Trip 1: Vande Bharat (NDLS -> CNB -> PRYJ -> BSB)
INSERT INTO route_stops (trip_id, station_id, stop_sequence, arrival_time, departure_time, halt_minutes, distance_km, platform) VALUES
(1, (SELECT id FROM stations WHERE code='NDLS'), 1, NULL,    '06:00', 0, 0,   '16'),
(1, (SELECT id FROM stations WHERE code='CNB'),  2, '10:08', '10:10', 2, 440, '1'),
(1, (SELECT id FROM stations WHERE code='PRYJ'), 3, '12:08', '12:10', 2, 635, '6'),
(1, (SELECT id FROM stations WHERE code='BSB'),  4, '14:00', NULL,    0, 759, '1');

-- Trip 2: Vande Bharat Reverse (BSB -> PRYJ -> CNB -> NDLS)
INSERT INTO route_stops (trip_id, station_id, stop_sequence, arrival_time, departure_time, halt_minutes, distance_km, platform) VALUES
(2, (SELECT id FROM stations WHERE code='BSB'),  1, NULL,    '15:00', 0, 0,   '1'),
(2, (SELECT id FROM stations WHERE code='PRYJ'), 2, '16:30', '16:32', 2, 124, '6'),
(2, (SELECT id FROM stations WHERE code='CNB'),  3, '18:30', '18:32', 2, 319, '1'),
(2, (SELECT id FROM stations WHERE code='NDLS'), 4, '23:00', NULL,    0, 759, '16');

-- Trip 3: HWH Rajdhani (HWH -> ASN -> DHN -> GAYA -> DDU -> PRYJ -> CNB -> NDLS)
INSERT INTO route_stops (trip_id, station_id, stop_sequence, arrival_time, departure_time, halt_minutes, distance_km, platform) VALUES
(3, (SELECT id FROM stations WHERE code='HWH'),  1, NULL,    '16:50', 0, 0,    '9'),
(3, (SELECT id FROM stations WHERE code='ASN'),  2, '18:57', '19:00', 3, 200,  '4'),
(3, (SELECT id FROM stations WHERE code='DHN'),  3, '19:50', '19:55', 5, 259,  '2'),
(3, (SELECT id FROM stations WHERE code='GAYA'), 4, '22:49', '22:52', 3, 459,  '1'),
(3, (SELECT id FROM stations WHERE code='DDU'),  5, '01:35', '01:45', 10, 664, '4'),
(3, (SELECT id FROM stations WHERE code='PRYJ'), 6, '03:35', '03:37', 2, 816,  '1'),
(3, (SELECT id FROM stations WHERE code='CNB'),  7, '05:40', '05:45', 5, 1011, '1'),
(3, (SELECT id FROM stations WHERE code='NDLS'), 8, '10:05', NULL,    0, 1451, '1');

-- Trip 4: HWH Rajdhani Reverse (NDLS -> CNB -> PRYJ -> DDU -> GAYA -> DHN -> ASN -> HWH)
INSERT INTO route_stops (trip_id, station_id, stop_sequence, arrival_time, departure_time, halt_minutes, distance_km, platform) VALUES
(4, (SELECT id FROM stations WHERE code='NDLS'), 1, NULL,    '16:55', 0, 0,    '1'),
(4, (SELECT id FROM stations WHERE code='CNB'),  2, '21:30', '21:35', 5, 440,  '1'),
(4, (SELECT id FROM stations WHERE code='PRYJ'), 3, '23:43', '23:45', 2, 635,  '4'),
(4, (SELECT id FROM stations WHERE code='DDU'),  4, '01:42', '01:52', 10, 787, '2'),
(4, (SELECT id FROM stations WHERE code='GAYA'), 5, '04:05', '04:08', 3, 992,  '1'),
(4, (SELECT id FROM stations WHERE code='DHN'),  6, '06:53', '06:58', 5, 1192, '2'),
(4, (SELECT id FROM stations WHERE code='ASN'),  7, '07:51', '07:53', 2, 1251, '5'),
(4, (SELECT id FROM stations WHERE code='HWH'),  8, '09:55', NULL,    0, 1451, '9');

-- Trip 5: HWH Shatabdi (HWH -> BWN -> DGR -> ASN -> DHN -> BKSC -> RNC)
INSERT INTO route_stops (trip_id, station_id, stop_sequence, arrival_time, departure_time, halt_minutes, distance_km, platform) VALUES
(5, (SELECT id FROM stations WHERE code='HWH'),  1, NULL,    '06:05', 0, 0,   '10'),
(5, (SELECT id FROM stations WHERE code='BWN'),  2, '07:11', '07:13', 2, 95,  '1'),
(5, (SELECT id FROM stations WHERE code='DGR'),  3, '07:58', '08:00', 2, 158, '3'),
(5, (SELECT id FROM stations WHERE code='ASN'),  4, '08:31', '08:35', 4, 200, '5'),
(5, (SELECT id FROM stations WHERE code='DHN'),  5, '09:40', '09:45', 5, 259, '1'),
(5, (SELECT id FROM stations WHERE code='BKSC'), 6, '11:15', '11:20', 5, 308, '1'),
(5, (SELECT id FROM stations WHERE code='RNC'),  7, '13:15', NULL,    0, 421, '1');

-- Trip 7: Mumbai-Ahmedabad Shatabdi (MMCT -> ST -> BRC -> ADI)
INSERT INTO route_stops (trip_id, station_id, stop_sequence, arrival_time, departure_time, halt_minutes, distance_km, platform) VALUES
(7, (SELECT id FROM stations WHERE code='MMCT'), 1, NULL,    '06:20', 0, 0,   '1'),
(7, (SELECT id FROM stations WHERE code='ST'),   2, '09:22', '09:25', 3, 263, '1'),
(7, (SELECT id FROM stations WHERE code='BRC'),  3, '10:55', '10:58', 3, 392, '2'),
(7, (SELECT id FROM stations WHERE code='ADI'),  4, '12:45', NULL,    0, 491, '5');


-- 5. COACHES
-- Train 1: Vande Bharat (CC and EC)
INSERT INTO coaches (train_id, code, class_code, class_name, fare, capacity) VALUES
(1, 'C1', 'CC', 'AC Chair Car', 1750, 78),
(1, 'C2', 'CC', 'AC Chair Car', 1750, 78),
(1, 'C3', 'CC', 'AC Chair Car', 1750, 78),
(1, 'E1', 'EC', 'Executive Anubhuti', 3300, 52);

-- Train 2: Howrah Rajdhani (1A, 2A, 3A)
INSERT INTO coaches (train_id, code, class_code, class_name, fare, capacity) VALUES
(2, 'H1', '1A', 'First AC', 4650, 24),
(2, 'A1', '2A', 'AC 2 Tier', 3150, 48),
(2, 'A2', '2A', 'AC 2 Tier', 3150, 48),
(2, 'B1', '3A', 'AC 3 Tier', 2250, 64),
(2, 'B2', '3A', 'AC 3 Tier', 2250, 64),
(2, 'B3', '3A', 'AC 3 Tier', 2250, 64);

-- Train 3: Shatabdi Express (CC, EC)
INSERT INTO coaches (train_id, code, class_code, class_name, fare, capacity) VALUES
(3, 'C1', 'CC', 'AC Chair Car', 950, 78),
(3, 'C2', 'CC', 'AC Chair Car', 950, 78),
(3, 'E1', 'EC', 'Executive Chair', 1850, 52);

-- Train 4: Mumbai Tejas Rajdhani (1A, 2A, 3A)
INSERT INTO coaches (train_id, code, class_code, class_name, fare, capacity) VALUES
(4, 'H1', '1A', 'First AC', 4850, 24),
(4, 'A1', '2A', 'AC 2 Tier', 3250, 48),
(4, 'B1', '3A', 'AC 3 Tier', 2350, 64);

-- Train 5: Mumbai - Ahmedabad Shatabdi (CC, EC)
INSERT INTO coaches (train_id, code, class_code, class_name, fare, capacity) VALUES
(5, 'C1', 'CC', 'AC Chair Car', 1050, 78),
(5, 'C2', 'CC', 'AC Chair Car', 1050, 78),
(5, 'E1', 'EC', 'Executive Chair', 2050, 52);

-- Train 8: Coromandel Express (SL, 3A, 2A)
INSERT INTO coaches (train_id, code, class_code, class_name, fare, capacity) VALUES
(8, 'S1', 'SL', 'Sleeper Class', 650, 72),
(8, 'S2', 'SL', 'Sleeper Class', 650, 72),
(8, 'B1', '3A', 'AC 3 Tier', 1750, 64),
(8, 'A1', '2A', 'AC 2 Tier', 2550, 48);


-- 6. GENERATE AUTHENTIC SEATS ACCORDING TO IRCTC BERTH FORMULAS
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
            IF coach.class_code IN ('SL', '3A') THEN
                -- 8-berth bay pattern: 1-Lower, 2-Middle, 3-Upper, 4-Lower, 5-Middle, 6-Upper, 7-Side Lower, 8-Side Upper
                CASE ((i - 1) % 8)
                    WHEN 0 THEN berth := 'Lower Berth';
                    WHEN 1 THEN berth := 'Middle Berth';
                    WHEN 2 THEN berth := 'Upper Berth';
                    WHEN 3 THEN berth := 'Lower Berth';
                    WHEN 4 THEN berth := 'Middle Berth';
                    WHEN 5 THEN berth := 'Upper Berth';
                    WHEN 6 THEN berth := 'Side Lower';
                    WHEN 7 THEN berth := 'Side Upper';
                END CASE;

            ELSIF coach.class_code = '2A' THEN
                -- 6-berth bay pattern: 1-Lower, 2-Upper, 3-Lower, 4-Upper, 5-Side Lower, 6-Side Upper
                CASE ((i - 1) % 6)
                    WHEN 0 THEN berth := 'Lower Berth';
                    WHEN 1 THEN berth := 'Upper Berth';
                    WHEN 2 THEN berth := 'Lower Berth';
                    WHEN 3 THEN berth := 'Upper Berth';
                    WHEN 4 THEN berth := 'Side Lower';
                    WHEN 5 THEN berth := 'Side Upper';
                END CASE;

            ELSIF coach.class_code = '1A' THEN
                -- Cabin / Coupe berths: Lower & Upper
                CASE ((i - 1) % 2)
                    WHEN 0 THEN berth := 'Cabin Lower';
                    WHEN 1 THEN berth := 'Cabin Upper';
                END CASE;

            ELSIF coach.class_code = 'EC' THEN
                berth := 'Executive Chair';

            ELSE
                berth := 'Window / Aisle Chair';
            END IF;

            INSERT INTO seats (coach_id, seat_number, berth_type)
            VALUES (coach.id, i::VARCHAR, berth);
        END LOOP;
    END LOOP;
END $$;


-- 7. DEFAULT TEST USER (Password: 'password123' hashed with bcrypt)
INSERT INTO users (id, name, email, password_hash) VALUES
(1, 'Arjun Sharma', 'arjun@railview.in', '$2b$10$wT8m96pX6tY5w4/1Zz.82.Z2x1yDfehR4Rz0tX0g1G5C5tA8O7vUa')
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));