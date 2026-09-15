import express from "express";
import { pool } from "../db.js";

const router = express.Router();


/*
==========================================
SEARCH TRAINS
==========================================

GET

/api/trains/search?from=HWH&to=DHN
*/

router.get("/search", async (req, res, next) => {

    try {

        const { from, to, date } = req.query;

        if (!from || !to) {

            return res.status(400).json({
                message: "from and to are required"
            });

        }

        if (from.toUpperCase() === to.toUpperCase()) {

            return res.status(400).json({
                message: "Origin and destination cannot be same"
            });

        }

        const result = await pool.query(
            `
            SELECT

                t.id AS train_id,
                t.train_number,
                t.name,
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
                tt.stops

            FROM train_trips tt

            JOIN trains t
                ON t.id = tt.train_id

            JOIN stations fs
                ON fs.id = tt.from_station_id

            JOIN stations ts
                ON ts.id = tt.to_station_id

            WHERE fs.code = $1
              AND ts.code = $2

            ORDER BY tt.departure_time
            `,
            [
                from.toUpperCase(),
                to.toUpperCase()
            ]
        );


        const trains = result.rows.map(train => ({

            trainId: train.train_id,

            trainNumber: train.train_number,

            name: train.name,

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

            durationMinutes: train.duration_minutes,

            stops: train.stops,

            status: train.status,

            amenities: train.amenities

        }));


        res.json(trains);

    } catch (error) {

        next(error);

    }

});


/*
==========================================
GET TRAIN
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
TRAIN CLASSES
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
TRAIN AVAILABILITY
==========================================

GET

/api/trains/1/availability
?from=HWH
&to=DHN
&date=2026-09-10
*/

router.get("/:trainId/availability", async (req, res, next) => {

    try {

        const trainId = Number(req.params.trainId);

        const {
            from,
            to,
            date
        } = req.query;


        if (!Number.isInteger(trainId)) {

            return res.status(400).json({
                message: "Invalid train ID"
            });

        }


        if (!from || !to || !date) {

            return res.status(400).json({
                message: "from, to and date are required"
            });

        }


        /*
        Find trip
        */

        const tripResult = await pool.query(
            `
            SELECT

                tt.id,

                tt.departure_time,

                tt.arrival_time,

                t.id AS train_id,

                t.train_number,

                t.name,

                fs.code AS from_code,

                fs.name AS from_name,

                ts.code AS to_code,

                ts.name AS to_name

            FROM train_trips tt

            JOIN trains t
                ON t.id = tt.train_id

            JOIN stations fs
                ON fs.id = tt.from_station_id

            JOIN stations ts
                ON ts.id = tt.to_station_id

            WHERE tt.train_id = $1

              AND fs.code = $2

              AND ts.code = $3

            LIMIT 1
            `,
            [
                trainId,
                from.toUpperCase(),
                to.toUpperCase()
            ]
        );


        if (tripResult.rows.length === 0) {

            return res.status(404).json({
                message: "Train route not found"
            });

        }


        const trip = tripResult.rows[0];


        /*
        Get coaches and seats
        */

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
                    WHEN bs.id IS NULL
                    THEN 'AVAILABLE'
                    ELSE 'BOOKED'
                END AS availability

            FROM coaches c

            JOIN seats s
                ON s.coach_id = c.id

            LEFT JOIN booking_seats bs
                ON bs.seat_id = s.id

            LEFT JOIN bookings b
                ON b.id = bs.booking_id
                AND b.trip_id = $1
                AND b.status IN ('PENDING', 'CONFIRMED')

            WHERE c.train_id = $2

            ORDER BY
                c.id,
                s.id
            `,
            [
                trip.id,
                trainId
            ]
        );


        /*
        Group coaches
        */

        const coachesMap = new Map();


        for (const row of coachResult.rows) {

            if (!coachesMap.has(row.coach_id)) {

                coachesMap.set(
                    row.coach_id,
                    {
                        id: row.coach_id,

                        code: row.code,

                        classCode: row.class_code,

                        className: row.class_name,

                        fare: Number(row.fare),

                        capacity: row.capacity,

                        availableSeats: 0,

                        seats: []
                    }
                );

            }


            const coach =
                coachesMap.get(row.coach_id);


            const isAvailable =
                row.availability === "AVAILABLE";


            if (isAvailable) {

                coach.availableSeats++;

            }


            coach.seats.push({

                id: row.seat_id,

                seatNumber: row.seat_number,

                berthType: row.berth_type,

                status: row.availability

            });

        }


        res.json({

            train: {

                id: trip.train_id,

                trainNumber: trip.train_number,

                name: trip.name

            },

            journey: {

                id: trip.id,

                from: {

                    code: trip.from_code,

                    name: trip.from_name

                },

                to: {

                    code: trip.to_code,

                    name: trip.to_name

                },

                date,

                departureTime:
                    trip.departure_time,

                arrivalTime:
                    trip.arrival_time

            },

            coaches:
                Array.from(coachesMap.values())

        });

    } catch (error) {

        next(error);

    }

});


export default router;