import express from "express";
import { pool } from "../db.js";

const router = express.Router();


/*
==========================================
SEARCH TRAINS
GET /api/trains/search?from=HWH&to=DHN&date=2026-10-15
==========================================
*/
router.get("/search", async (req, res, next) => {
    try {
        const { from, to, date } = req.query;

        if (!from || !to) {
            return res.status(400).json({
                message: "from and to are required"
            });
        }

        const fromCode = from.trim().toUpperCase();
        const toCode = to.trim().toUpperCase();

        if (fromCode === toCode) {
            return res.status(400).json({
                message: "Origin and destination cannot be same"
            });
        }

        // Search via intermediate route_stops OR direct train_trips
        const result = await pool.query(
            `
            WITH direct_matches AS (
                SELECT
                    t.id AS train_id,
                    t.train_number,
                    t.name,
                    t.train_type,
                    t.status,
                    t.amenities,
                    tt.id AS trip_id,
                    fs.code AS from_code,
                    fs.name AS from_name,
                    ts.code AS to_code,
                    ts.name AS to_name,
                    tt.departure_time,
                    tt.arrival_time,
                    tt.duration_minutes,
                    tt.stops,
                    1 AS from_seq,
                    (tt.stops + 2) AS to_seq
                FROM train_trips tt
                JOIN trains t ON t.id = tt.train_id
                JOIN stations fs ON fs.id = tt.from_station_id
                JOIN stations ts ON ts.id = tt.to_station_id
                WHERE fs.code = $1 AND ts.code = $2
            ),
            stop_matches AS (
                SELECT
                    t.id AS train_id,
                    t.train_number,
                    t.name,
                    t.train_type,
                    t.status,
                    t.amenities,
                    tt.id AS trip_id,
                    fs.code AS from_code,
                    fs.name AS from_name,
                    ts.code AS to_code,
                    ts.name AS to_name,
                    COALESCE(rs_from.departure_time, tt.departure_time) AS departure_time,
                    COALESCE(rs_to.arrival_time, tt.arrival_time) AS arrival_time,
                    CASE
                        WHEN rs_from.departure_time IS NOT NULL AND rs_to.arrival_time IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (rs_to.arrival_time - rs_from.departure_time)) / 60
                        ELSE tt.duration_minutes
                    END::integer AS duration_minutes,
                    GREATEST(0, rs_to.stop_sequence - rs_from.stop_sequence - 1) AS stops,
                    rs_from.stop_sequence AS from_seq,
                    rs_to.stop_sequence AS to_seq
                FROM train_trips tt
                JOIN trains t ON t.id = tt.train_id
                JOIN route_stops rs_from ON rs_from.trip_id = tt.id
                JOIN stations fs ON fs.id = rs_from.station_id
                JOIN route_stops rs_to ON rs_to.trip_id = tt.id
                JOIN stations ts ON ts.id = rs_to.station_id
                WHERE fs.code = $1
                  AND ts.code = $2
                  AND rs_from.stop_sequence < rs_to.stop_sequence
            )
            SELECT * FROM stop_matches
            UNION
            SELECT * FROM direct_matches
            WHERE trip_id NOT IN (SELECT trip_id FROM stop_matches)
            ORDER BY departure_time
            `,
            [fromCode, toCode]
        );

        const trains = result.rows.map(train => {
            const rawDuration = train.duration_minutes;
            // Handle negative duration if journey spans midnight
            const durationMinutes = rawDuration < 0 ? rawDuration + 1440 : (rawDuration || 180);

            return {
                trainId: train.train_id,
                trainNumber: train.train_number,
                name: train.name,
                trainType: train.train_type || "SUPERFAST",
                tripId: train.trip_id,
                from: {
                    code: train.from_code,
                    name: train.from_name
                },
                to: {
                    code: train.to_code,
                    name: train.to_name
                },
                departure: train.departure_time,
                arrival: train.arrival_time,
                durationMinutes,
                stops: train.stops,
                status: train.status,
                amenities: train.amenities || [],
                date: date || new Date().toISOString().split('T')[0]
            };
        });

        res.json(trains);
    } catch (error) {
        next(error);
    }
});


/*
==========================================
GET TRAIN DETAILS
GET /api/trains/:trainId
==========================================
*/
router.get("/:trainId", async (req, res, next) => {
    try {
        const { trainId } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                train_number,
                name,
                train_type,
                status,
                amenities
            FROM trains
            WHERE id = $1
               OR train_number = $2
            LIMIT 1
            `,
            [
                Number(trainId) || -1,
                trainId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Train not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});


/*
==========================================
TRAIN SCHEDULE (INTERMEDIATE STOPS)
GET /api/trains/:trainId/schedule
==========================================
*/
router.get("/:trainId/schedule", async (req, res, next) => {
    try {
        const trainId = Number(req.params.trainId);

        if (!Number.isInteger(trainId)) {
            return res.status(400).json({
                message: "Invalid train ID"
            });
        }

        const stopsResult = await pool.query(
            `
            SELECT
                rs.stop_sequence,
                s.name AS station_name,
                s.code AS station_code,
                s.city,
                s.state,
                rs.arrival_time,
                rs.departure_time,
                rs.halt_minutes,
                rs.distance_km,
                rs.platform
            FROM route_stops rs
            JOIN stations s ON s.id = rs.station_id
            JOIN train_trips tt ON tt.id = rs.trip_id
            WHERE tt.train_id = $1
            ORDER BY rs.stop_sequence ASC
            `,
            [trainId]
        );

        res.json(stopsResult.rows.map(row => ({
            sequence: row.stop_sequence,
            stationName: row.station_name,
            stationCode: row.station_code,
            city: row.city,
            state: row.state,
            arrival: row.arrival_time,
            departure: row.departure_time,
            haltMinutes: row.halt_minutes,
            distanceKm: row.distance_km,
            platform: row.platform
        })));
    } catch (error) {
        next(error);
    }
});


/*
==========================================
TRAIN CLASSES
GET /api/trains/:trainId/classes
==========================================
*/
router.get("/:trainId/classes", async (req, res, next) => {
    try {
        const trainId = Number(req.params.trainId);

        if (!Number.isInteger(trainId)) {
            return res.status(400).json({
                message: "Invalid train ID"
            });
        }

        const result = await pool.query(
            `
            SELECT
                class_code,
                class_name,
                MIN(fare) AS fare,
                COUNT(*) AS coaches
            FROM coaches
            WHERE train_id = $1
            GROUP BY
                class_code,
                class_name
            ORDER BY MIN(fare)
            `,
            [trainId]
        );

        res.json(
            result.rows.map(row => ({
                code: row.class_code,
                name: row.class_name,
                fare: Number(row.fare),
                coaches: Number(row.coaches)
            }))
        );
    } catch (error) {
        next(error);
    }
});


/*
==========================================
TRAIN SEAT AVAILABILITY (PARTIAL-ROUTE AWARE)
GET /api/trains/:trainId/availability?from=HWH&to=DHN&date=2026-10-15
==========================================
*/
router.get("/:trainId/availability", async (req, res, next) => {
    try {
        const trainId = Number(req.params.trainId);
        const { from, to, date } = req.query;

        if (!Number.isInteger(trainId)) {
            return res.status(400).json({
                message: "Invalid train ID"
            });
        }

        if (!from || !to) {
            return res.status(400).json({
                message: "from and to are required"
            });
        }

        const journeyDate = date ? date.split('T')[0] : new Date().toISOString().split('T')[0];
        const fromCode = from.trim().toUpperCase();
        const toCode = to.trim().toUpperCase();

        // 1. Resolve trip and stop sequences for partial-route check
        const tripStopResult = await pool.query(
            `
            SELECT
                tt.id AS trip_id,
                tt.departure_time,
                tt.arrival_time,
                t.id AS train_id,
                t.train_number,
                t.name AS train_name,
                fs.id AS from_station_id,
                fs.code AS from_code,
                fs.name AS from_name,
                ts.id AS to_station_id,
                ts.code AS to_code,
                ts.name AS to_name,
                rs_from.id AS boarding_stop_id,
                COALESCE(rs_from.stop_sequence, 1) AS from_seq,
                COALESCE(rs_from.departure_time, tt.departure_time) AS seg_departure,
                rs_to.id AS alighting_stop_id,
                COALESCE(rs_to.stop_sequence, tt.stops + 2) AS to_seq,
                COALESCE(rs_to.arrival_time, tt.arrival_time) AS seg_arrival
            FROM train_trips tt
            JOIN trains t ON t.id = tt.train_id
            JOIN stations fs ON fs.code = $2
            JOIN stations ts ON ts.code = $3
            LEFT JOIN route_stops rs_from ON rs_from.trip_id = tt.id AND rs_from.station_id = fs.id
            LEFT JOIN route_stops rs_to ON rs_to.trip_id = tt.id AND rs_to.station_id = ts.id
            WHERE tt.train_id = $1
              AND (
                  (rs_from.stop_sequence IS NOT NULL AND rs_to.stop_sequence IS NOT NULL AND rs_from.stop_sequence < rs_to.stop_sequence)
                  OR (tt.from_station_id = fs.id AND tt.to_station_id = ts.id)
              )
            LIMIT 1
            `,
            [trainId, fromCode, toCode]
        );

        if (tripStopResult.rows.length === 0) {
            return res.status(404).json({
                message: "Train route or station pair not found for this train"
            });
        }

        const tripInfo = tripStopResult.rows[0];
        const qFromSeq = tripInfo.from_seq;
        const qToSeq = tripInfo.to_seq;

        // 2. Query coaches & seats with PARTIAL ROUTE availability overlap checking
        const coachResult = await pool.query(
            `
            SELECT
                c.id AS coach_id,
                c.code,
                c.class_code,
                c.class_name,
                c.fare,
                c.capacity,
                s.id AS seat_id,
                s.seat_number,
                s.berth_type,
                CASE
                    WHEN overlap_booking.booking_id IS NULL THEN 'AVAILABLE'
                    ELSE 'BOOKED'
                END AS availability
            FROM coaches c
            JOIN seats s ON s.coach_id = c.id
            LEFT JOIN LATERAL (
                SELECT b.id AS booking_id
                FROM booking_seats bs
                JOIN bookings b ON b.id = bs.booking_id
                LEFT JOIN route_stops b_from ON b_from.id = b.boarding_stop_id
                LEFT JOIN route_stops b_to ON b_to.id = b.alighting_stop_id
                WHERE bs.seat_id = s.id
                  AND b.trip_id = $1
                  AND b.journey_date = $3::date
                  AND b.status IN ('PENDING', 'CONFIRMED')
                  AND (
                      -- Segment overlap condition: [b_from, b_to) overlaps with [qFromSeq, qToSeq)
                      (b_from.stop_sequence IS NOT NULL AND b_to.stop_sequence IS NOT NULL
                       AND b_from.stop_sequence < $5
                       AND b_to.stop_sequence > $4)
                      OR
                      -- Fallback if booking does not specify stops (covers entire route)
                      (b.boarding_stop_id IS NULL OR b.alighting_stop_id IS NULL)
                  )
                LIMIT 1
            ) overlap_booking ON true
            WHERE c.train_id = $2
            ORDER BY c.id, s.id
            `,
            [tripInfo.trip_id, trainId, journeyDate, qFromSeq, qToSeq]
        );

        // 3. Group seats by coach
        const coachesMap = new Map();

        for (const row of coachResult.rows) {
            if (!coachesMap.has(row.coach_id)) {
                coachesMap.set(row.coach_id, {
                    id: row.coach_id,
                    coachId: row.coach_id,
                    code: row.code,
                    coachNumber: row.code,
                    classCode: row.class_code,
                    classType: row.class_code,
                    className: row.class_name,
                    fare: Number(row.fare),
                    capacity: row.capacity,
                    availableSeats: 0,
                    seats: []
                });
            }

            const coach = coachesMap.get(row.coach_id);
            const isAvailable = row.availability === "AVAILABLE";

            if (isAvailable) {
                coach.availableSeats++;
            }

            coach.seats.push({
                id: row.seat_id,
                seatNumber: row.seat_number,
                berthType: row.berth_type,
                status: row.availability,
                available: isAvailable
            });
        }

        res.json({
            train: {
                id: tripInfo.train_id,
                trainNumber: tripInfo.train_number,
                name: tripInfo.train_name
            },
            journey: {
                id: tripInfo.trip_id,
                from: {
                    code: tripInfo.from_code,
                    name: tripInfo.from_name
                },
                to: {
                    code: tripInfo.to_code,
                    name: tripInfo.to_name
                },
                date: journeyDate,
                departureTime: tripInfo.seg_departure,
                arrivalTime: tripInfo.seg_arrival,
                boardingStopId: tripInfo.boarding_stop_id,
                alightingStopId: tripInfo.alighting_stop_id
            },
            coaches: Array.from(coachesMap.values())
        });
    } catch (error) {
        next(error);
    }
});

export default router;
