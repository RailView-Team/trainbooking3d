import express from "express";

import { pool } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import {
    generatePNR,
    generateTransactionId
} from "../utils/pnr.js";

const router = express.Router();


/*
================================================
CREATE BOOKING
================================================

POST /api/bookings
*/

router.post("/", async (req, res, next) => {

    const client = await pool.connect();

    try {

        const {
            trainId,
            from,
            to,
            date,
            classCode,
            coachId,
            seats,
            passengers,
            contactEmail,
            contactPhone
        } = req.body;


        /*
        Basic validation
        */

        if (
            !trainId ||
            !from ||
            !to ||
            !date ||
            !classCode ||
            !coachId ||
            !Array.isArray(seats) ||
            !Array.isArray(passengers)
        ) {

            return res.status(400).json({
                message: "Invalid booking data"
            });

        }


        if (seats.length === 0) {

            return res.status(400).json({
                message: "At least one seat is required"
            });

        }


        if (seats.length !== passengers.length) {

            return res.status(400).json({
                message:
                    "Number of passengers must match number of seats"
            });

        }


        await client.query("BEGIN");


        /*
        Find coach
        */

        const coachResult =
            await client.query(
                `
                SELECT
                    id,
                    train_id,
                    class_code,
                    class_name,
                    fare
                FROM coaches

                WHERE id = $1
                  AND train_id = $2
                `,
                [
                    coachId,
                    trainId
                ]
            );


        if (coachResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Coach not found"
            });

        }


        const coach =
            coachResult.rows[0];


        if (
            coach.class_code !== classCode
        ) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Invalid class for selected coach"
            });

        }


        /*
        Find journey
        */

        const tripResult =
            await client.query(
                `
                SELECT
                    tt.id

                FROM train_trips tt

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

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Journey not found"
            });

        }


        const tripId =
            tripResult.rows[0].id;


        /*
        Convert seat IDs to integers
        */

        const seatIds =
            seats.map(Number);


        if (
            seatIds.some(
                id => !Number.isInteger(id)
            )
        ) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Invalid seat IDs"
            });

        }


        /*
        Lock seats.

        This prevents two requests from
        booking the same seat simultaneously.
        */

        const seatResult =
            await client.query(
                `
                SELECT
                    id,
                    seat_number

                FROM seats

                WHERE id = ANY($1::int[])

                  AND coach_id = $2

                FOR UPDATE
                `,
                [
                    seatIds,
                    coachId
                ]
            );


        if (
            seatResult.rows.length !==
            seatIds.length
        ) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                message:
                    "One or more seats do not belong to this coach"
            });

        }


        /*
        Check whether selected seats
        are already booked for this trip.
        */

        const bookedResult =
            await client.query(
                `
                SELECT
                    bs.seat_id

                FROM booking_seats bs

                JOIN bookings b
                    ON b.id = bs.booking_id

                WHERE b.trip_id = $1

                  AND b.status IN
                    ('PENDING', 'CONFIRMED')

                  AND bs.seat_id = ANY($2::int[])

                FOR UPDATE
                `,
                [
                    tripId,
                    seatIds
                ]
            );


        if (bookedResult.rows.length > 0) {

            await client.query("ROLLBACK");

            return res.status(409).json({

                message:
                    "One or more selected seats are already booked",

                seats:
                    bookedResult.rows.map(
                        row => row.seat_id
                    )

            });

        }


        /*
        Calculate total
        */

        const totalAmount =
            Number(coach.fare) *
            passengers.length;


        /*
        Generate PNR
        */

        const pnr =
            generatePNR();


        /*
        Create booking
        */

        const bookingResult =
            await client.query(
                `
                INSERT INTO bookings
                (
                    pnr,
                    user_id,
                    trip_id,
                    coach_id,
                    status,
                    payment_status,
                    total_amount,
                    contact_email,
                    contact_phone
                )

                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    'PENDING',
                    'PENDING',
                    $5,
                    $6,
                    $7
                )

                RETURNING *
                `,
                [
                    pnr,
                    null,
                    tripId,
                    coachId,
                    totalAmount,
                    contactEmail || null,
                    contactPhone || null
                ]
            );


        const booking =
            bookingResult.rows[0];


        /*
        Insert booking seats
        */

        for (const seatId of seatIds) {

            await client.query(
                `
                INSERT INTO booking_seats
                (
                    booking_id,
                    seat_id
                )

                VALUES
                ($1, $2)
                `,
                [
                    booking.id,
                    seatId
                ]
            );

        }


        /*
        Insert passengers
        */

        for (
            let i = 0;
            i < passengers.length;
            i++
        ) {

            const passenger =
                passengers[i];


            await client.query(
                `
                INSERT INTO passengers
                (
                    booking_id,
                    seat_id,
                    name,
                    age,
                    gender,
                    berth_preference
                )

                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
                `,
                [
                    booking.id,

                    String(
                        passenger.seatId
                    ),

                    passenger.name,

                    Number(
                        passenger.age
                    ),

                    passenger.gender,

                    passenger.berthPreference
                        || null
                ]
            );

        }


        /*
        Create pending payment
        */

        await client.query(
            `
            INSERT INTO payments
            (
                booking_id,
                amount,
                status
            )

            VALUES
            (
                $1,
                $2,
                'PENDING'
            )
            `,
            [
                booking.id,
                totalAmount
            ]
        );


        await client.query("COMMIT");


        res.status(201).json({

            message:
                "Booking created successfully",

            booking: {

                id: booking.id,

                pnr: booking.pnr,

                status: booking.status,

                paymentStatus:
                    booking.payment_status,

                totalAmount,

                seats:
                    seatResult.rows.map(
                        seat => ({
                            id: seat.id,
                            seatNumber:
                                seat.seat_number
                        })
                    ),

                passengers

            }

        });

    } catch (error) {

        await client.query("ROLLBACK");

        next(error);

    } finally {

        client.release();

    }

});


/*
================================================
GET BOOKING
================================================

GET /api/bookings/:id
*/

router.get("/:id", async (req, res, next) => {

    try {

        const bookingId =
            Number(req.params.id);


        if (!Number.isInteger(bookingId)) {

            return res.status(400).json({
                message: "Invalid booking ID"
            });

        }


        const bookingResult =
            await pool.query(
                `
                SELECT

                    b.id,
                    b.pnr,
                    b.status,
                    b.payment_status,
                    b.total_amount,
                    b.contact_email,
                    b.contact_phone,
                    b.created_at,

                    t.id AS train_id,
                    t.train_number,
                    t.name AS train_name,

                    fs.code AS from_code,
                    fs.name AS from_name,

                    ts.code AS to_code,
                    ts.name AS to_name,

                    c.id AS coach_id,
                    c.code AS coach_code,
                    c.class_code,
                    c.class_name

                FROM bookings b

                JOIN train_trips tt
                    ON tt.id = b.trip_id

                JOIN trains t
                    ON t.id = tt.train_id

                JOIN stations fs
                    ON fs.id = tt.from_station_id

                JOIN stations ts
                    ON ts.id = tt.to_station_id

                JOIN coaches c
                    ON c.id = b.coach_id

                WHERE b.id = $1
                `,
                [bookingId]
            );


        if (bookingResult.rows.length === 0) {

            return res.status(404).json({
                message: "Booking not found"
            });

        }


        const booking =
            bookingResult.rows[0];


        /*
        Passengers
        */

        const passengerResult =
            await pool.query(
                `
                SELECT

                    id,
                    seat_id,
                    name,
                    age,
                    gender,
                    berth_preference

                FROM passengers

                WHERE booking_id = $1

                ORDER BY id
                `,
                [bookingId]
            );


        /*
        Seats
        */

        const seatResult =
            await pool.query(
                `
                SELECT

                    s.id,
                    s.seat_number,
                    s.berth_type

                FROM booking_seats bs

                JOIN seats s
                    ON s.id = bs.seat_id

                WHERE bs.booking_id = $1

                ORDER BY s.id
                `,
                [bookingId]
            );


        /*
        Payment
        */

        const paymentResult =
            await pool.query(
                `
                SELECT

                    id,
                    amount,
                    status,
                    method,
                    transaction_id,
                    created_at

                FROM payments

                WHERE booking_id = $1
                `,
                [bookingId]
            );


        res.json({

            id: booking.id,

            pnr: booking.pnr,

            status: booking.status,

            paymentStatus:
                booking.payment_status,

            totalAmount:
                Number(booking.total_amount),

            train: {

                id: booking.train_id,

                trainNumber:
                    booking.train_number,

                name:
                    booking.train_name

            },

            route: {

                from: {
                    code: booking.from_code,
                    name: booking.from_name
                },

                to: {
                    code: booking.to_code,
                    name: booking.to_name
                }

            },

            coach: {

                id: booking.coach_id,

                code: booking.coach_code,

                classCode:
                    booking.class_code,

                className:
                    booking.class_name

            },

            passengers:
                passengerResult.rows,

            seats:
                seatResult.rows,

            payment:
                paymentResult.rows[0] || null,

            createdAt:
                booking.created_at

        });

    } catch (error) {

        next(error);

    }

});


/*
================================================
PAYMENT
================================================

POST /api/bookings/:id/payment
*/

router.post(
    "/:id/payment",
    async (req, res, next) => {

        const client =
            await pool.connect();

        try {

            const bookingId =
                Number(req.params.id);

            const {
                method
            } = req.body;


            await client.query("BEGIN");


            const bookingResult =
                await client.query(
                    `
                    SELECT *

                    FROM bookings

                    WHERE id = $1

                    FOR UPDATE
                    `,
                    [bookingId]
                );


            if (
                bookingResult.rows.length === 0
            ) {

                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: "Booking not found"
                });

            }


            const booking =
                bookingResult.rows[0];


            if (
                booking.status === "CANCELLED"
            ) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    message:
                        "Cancelled booking cannot be paid"
                });

            }


            const transactionId =
                generateTransactionId();


            await client.query(
                `
                UPDATE payments

                SET
                    status = 'PAID',
                    method = $1,
                    transaction_id = $2

                WHERE booking_id = $3
                `,
                [
                    method || "DEMO_CARD",
                    transactionId,
                    bookingId
                ]
            );


            await client.query(
                `
                UPDATE bookings

                SET
                    status = 'CONFIRMED',
                    payment_status = 'PAID'

                WHERE id = $1
                `,
                [bookingId]
            );


            await client.query("COMMIT");


            res.json({

                message:
                    "Payment successful",

                bookingId,

                pnr:
                    booking.pnr,

                status:
                    "CONFIRMED",

                paymentStatus:
                    "PAID",

                transactionId

            });

        } catch (error) {

            await client.query("ROLLBACK");

            next(error);

        } finally {

            client.release();

        }

    }
);


/*
================================================
CANCEL BOOKING
================================================

POST /api/bookings/:id/cancel
*/

router.post(
    "/:id/cancel",
    async (req, res, next) => {

        try {

            const bookingId =
                Number(req.params.id);


            const result =
                await pool.query(
                    `
                    UPDATE bookings

                    SET
                        status = 'CANCELLED',

                        payment_status =
                            CASE
                                WHEN payment_status = 'PAID'
                                THEN 'REFUNDED'
                                ELSE payment_status
                            END

                    WHERE id = $1

                      AND status != 'CANCELLED'

                    RETURNING
                        id,
                        pnr,
                        status,
                        payment_status
                    `,
                    [bookingId]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    message:
                        "Booking not found or already cancelled"
                });

            }


            res.json({

                message:
                    "Booking cancelled",

                booking:
                    result.rows[0]

            });

        } catch (error) {

            next(error);

        }

    }
);


/*
================================================
USER BOOKING HISTORY
================================================

GET /api/bookings

Requires JWT
*/

router.get(
    "/",
    authenticate,
    async (req, res, next) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT

                        b.id,
                        b.pnr,
                        b.status,
                        b.payment_status,
                        b.total_amount,
                        b.created_at,

                        t.train_number,
                        t.name AS train_name,

                        fs.code AS from_code,

                        ts.code AS to_code

                    FROM bookings b

                    JOIN train_trips tt
                        ON tt.id = b.trip_id

                    JOIN trains t
                        ON t.id = tt.train_id

                    JOIN stations fs
                        ON fs.id = tt.from_station_id

                    JOIN stations ts
                        ON ts.id = tt.to_station_id

                    WHERE b.user_id = $1

                    ORDER BY
                        b.created_at DESC
                    `,
                    [req.user.id]
                );


            res.json(
                result.rows.map(row => ({
                    id: row.id,

                    pnr: row.pnr,

                    status: row.status,

                    paymentStatus:
                        row.payment_status,

                    totalAmount:
                        Number(row.total_amount),

                    train: {
                        number:
                            row.train_number,

                        name:
                            row.train_name
                    },

                    from:
                        row.from_code,

                    to:
                        row.to_code,

                    createdAt:
                        row.created_at
                }))
            );

        } catch (error) {

            next(error);

        }

    }
);


export default router;