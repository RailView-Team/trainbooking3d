import express from "express";
import { pool } from "../db.js";
import { authenticate, authenticateOptional } from "../middleware/auth.js";
import {
    generatePNR,
    generateTransactionId
} from "../utils/pnr.js";

const router = express.Router();


/*
================================================
CREATE BOOKING
POST /api/bookings
================================================
*/
router.post("/", authenticateOptional, async (req, res, next) => {
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

        if (
            !trainId ||
            !from ||
            !to ||
            !classCode ||
            !coachId ||
            !Array.isArray(seats) ||
            !Array.isArray(passengers)
        ) {
            return res.status(400).json({
                message: "Invalid booking data. Missing required fields."
            });
        }

        if (seats.length === 0) {
            return res.status(400).json({
                message: "At least one seat must be selected"
            });
        }

        if (seats.length !== passengers.length) {
            return res.status(400).json({
                message: "Number of passengers must match number of seats"
            });
        }

        const journeyDate = date ? date.split('T')[0] : new Date().toISOString().split('T')[0];
        const fromCode = from.trim().toUpperCase();
        const toCode = to.trim().toUpperCase();
        const userId = req.user?.id || null;

        await client.query("BEGIN");

        // 1. Verify Coach
        const coachResult = await client.query(
            `
            SELECT id, train_id, class_code, class_name, fare
            FROM coaches
            WHERE id = $1 AND train_id = $2
            `,
            [coachId, trainId]
        );

        if (coachResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Coach not found for this train" });
        }

        const coach = coachResult.rows[0];

        if (coach.class_code !== classCode) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Invalid class for selected coach" });
        }

        // 2. Resolve Trip and Route Stops
        const tripStopResult = await client.query(
            `
            SELECT
                tt.id AS trip_id,
                rs_from.id AS boarding_stop_id,
                COALESCE(rs_from.stop_sequence, 1) AS from_seq,
                rs_to.id AS alighting_stop_id,
                COALESCE(rs_to.stop_sequence, tt.stops + 2) AS to_seq
            FROM train_trips tt
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
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Journey route not found" });
        }

        const trip = tripStopResult.rows[0];
        const tripId = trip.trip_id;
        const boardingStopId = trip.boarding_stop_id;
        const alightingStopId = trip.alighting_stop_id;
        const qFromSeq = trip.from_seq;
        const qToSeq = trip.to_seq;

        // 3. Verify & Lock Seats
        const seatIds = seats.map(Number);
        if (seatIds.some(id => !Number.isInteger(id))) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Invalid seat IDs" });
        }

        const seatResult = await client.query(
            `
            SELECT id, seat_number
            FROM seats
            WHERE id = ANY($1::int[]) AND coach_id = $2
            FOR UPDATE
            `,
            [seatIds, coachId]
        );

        if (seatResult.rows.length !== seatIds.length) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "One or more seats do not belong to this coach" });
        }

        // 4. Concurrency & Partial-Route Overlap Check
        const overlapResult = await client.query(
            `
            SELECT bs.seat_id
            FROM booking_seats bs
            JOIN bookings b ON b.id = bs.booking_id
            LEFT JOIN route_stops b_from ON b_from.id = b.boarding_stop_id
            LEFT JOIN route_stops b_to ON b_to.id = b.alighting_stop_id
            WHERE bs.seat_id = ANY($1::int[])
              AND b.trip_id = $2
              AND b.journey_date = $3::date
              AND b.status IN ('PENDING', 'CONFIRMED')
              AND (
                  -- Segment overlap condition: [b_from, b_to) overlaps with [qFromSeq, qToSeq)
                  (b_from.stop_sequence IS NOT NULL AND b_to.stop_sequence IS NOT NULL
                   AND b_from.stop_sequence < $5
                   AND b_to.stop_sequence > $4)
                  OR
                  (b.boarding_stop_id IS NULL OR b.alighting_stop_id IS NULL)
              )
            FOR UPDATE
            `,
            [seatIds, tripId, journeyDate, qFromSeq, qToSeq]
        );

        if (overlapResult.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                message: "One or more selected seats are already booked on this segment",
                seats: overlapResult.rows.map(row => row.seat_id)
            });
        }

        // 5. Create Booking
        const totalAmount = Number(coach.fare) * passengers.length;
        const pnr = generatePNR();

        const bookingResult = await client.query(
            `
            INSERT INTO bookings (
                pnr, user_id, trip_id, coach_id,
                boarding_stop_id, alighting_stop_id, journey_date,
                status, payment_status, total_amount,
                contact_email, contact_phone
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', 'PENDING', $8, $9, $10)
            RETURNING *
            `,
            [
                pnr, userId, tripId, coachId,
                boardingStopId, alightingStopId, journeyDate,
                totalAmount, contactEmail || null, contactPhone || null
            ]
        );

        const booking = bookingResult.rows[0];

        // 6. Bulk Insert Booking Seats
        const seatValues = seatIds.map((id, idx) => `($1, $${idx + 2})`).join(', ');
        await client.query(
            `INSERT INTO booking_seats (booking_id, seat_id) VALUES ${seatValues}`,
            [booking.id, ...seatIds]
        );

        // 7. Bulk Insert Passengers
        const passengerParams = [booking.id];
        const passengerPlaceholders = passengers.map((p, idx) => {
            const base = 1 + idx * 5;
            passengerParams.push(
                Number(p.seatId) || seatIds[idx],
                p.name || 'Passenger',
                Number(p.age) || 25,
                p.gender || 'Other',
                p.berthPreference || null
            );
            return `($1, $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
        }).join(', ');

        await client.query(
            `
            INSERT INTO passengers (
                booking_id, seat_id, name, age, gender, berth_preference
            ) VALUES ${passengerPlaceholders}
            `,
            passengerParams
        );

        // 8. Create Pending Payment
        await client.query(
            `INSERT INTO payments (booking_id, amount, status) VALUES ($1, $2, 'PENDING')`,
            [booking.id, totalAmount]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Booking created successfully",
            booking: {
                id: booking.id,
                pnr: booking.pnr,
                status: booking.status,
                paymentStatus: booking.payment_status,
                totalAmount,
                journeyDate,
                seats: seatResult.rows.map(seat => ({
                    id: seat.id,
                    seatNumber: seat.seat_number
                })),
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
GET BOOKING BY ID OR PNR
GET /api/bookings/:id
================================================
*/
router.get("/:id", async (req, res, next) => {
    try {
        const idOrPnr = req.params.id.trim();
        const isNumeric = /^\d+$/.test(idOrPnr) && idOrPnr.length < 9;

        const bookingResult = await pool.query(
            `
            SELECT
                b.id,
                b.pnr,
                b.status,
                b.payment_status,
                b.total_amount,
                b.journey_date,
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
            JOIN train_trips tt ON tt.id = b.trip_id
            JOIN trains t ON t.id = tt.train_id
            JOIN stations fs ON fs.id = tt.from_station_id
            JOIN stations ts ON ts.id = tt.to_station_id
            JOIN coaches c ON c.id = b.coach_id
            WHERE ${isNumeric ? 'b.id = $1' : 'b.pnr = $1'}
            LIMIT 1
            `,
            [isNumeric ? Number(idOrPnr) : idOrPnr]
        );

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = bookingResult.rows[0];

        const passengerResult = await pool.query(
            `SELECT id, seat_id, name, age, gender, berth_preference FROM passengers WHERE booking_id = $1 ORDER BY id`,
            [booking.id]
        );

        const seatResult = await pool.query(
            `
            SELECT s.id, s.seat_number, s.berth_type
            FROM booking_seats bs
            JOIN seats s ON s.id = bs.seat_id
            WHERE bs.booking_id = $1
            ORDER BY s.id
            `,
            [booking.id]
        );

        const paymentResult = await pool.query(
            `SELECT id, amount, status, method, transaction_id, created_at FROM payments WHERE booking_id = $1`,
            [booking.id]
        );

        res.json({
            id: booking.id,
            pnr: booking.pnr,
            status: booking.status,
            paymentStatus: booking.payment_status,
            totalAmount: Number(booking.total_amount),
            journeyDate: booking.journey_date,
            createdAt: booking.created_at,
            train: {
                id: booking.train_id,
                trainNumber: booking.train_number,
                name: booking.train_name
            },
            route: {
                from: { code: booking.from_code, name: booking.from_name },
                to: { code: booking.to_code, name: booking.to_name }
            },
            coach: {
                id: booking.coach_id,
                code: booking.coach_code,
                classCode: booking.class_code,
                className: booking.class_name
            },
            seats: seatResult.rows,
            passengers: passengerResult.rows,
            payment: paymentResult.rows[0] || null
        });
    } catch (error) {
        next(error);
    }
});


/*
================================================
PROCESS PAYMENT FOR BOOKING
POST /api/bookings/:id/payment
================================================
*/
router.post("/:id/payment", async (req, res, next) => {
    const client = await pool.connect();

    try {
        const bookingId = Number(req.params.id);
        const { method } = req.body;

        if (!Number.isInteger(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        await client.query("BEGIN");

        const bookingResult = await client.query(
            `SELECT id, status, payment_status, total_amount FROM bookings WHERE id = $1 FOR UPDATE`,
            [bookingId]
        );

        if (bookingResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = bookingResult.rows[0];

        if (booking.payment_status === "PAID") {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Booking is already paid" });
        }

        const transactionId = generateTransactionId();

        await client.query(
            `
            UPDATE payments
            SET status = 'PAID', method = $1, transaction_id = $2
            WHERE booking_id = $3
            `,
            [method || "UPI", transactionId, bookingId]
        );

        await client.query(
            `
            UPDATE bookings
            SET status = 'CONFIRMED', payment_status = 'PAID'
            WHERE id = $1
            `,
            [bookingId]
        );

        await client.query("COMMIT");

        res.json({
            message: "Payment processed successfully",
            transactionId,
            status: "CONFIRMED"
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
CANCEL BOOKING
POST /api/bookings/:id/cancel
================================================
*/
router.post("/:id/cancel", authenticateOptional, async (req, res, next) => {
    const client = await pool.connect();

    try {
        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        await client.query("BEGIN");

        const bookingResult = await client.query(
            `SELECT id, user_id, status FROM bookings WHERE id = $1 FOR UPDATE`,
            [bookingId]
        );

        if (bookingResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = bookingResult.rows[0];

        if (req.user && booking.user_id && booking.user_id !== req.user.id) {
            await client.query("ROLLBACK");
            return res.status(403).json({ message: "You are not authorized to cancel this booking" });
        }

        if (booking.status === "CANCELLED") {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        await client.query(
            `UPDATE bookings SET status = 'CANCELLED', payment_status = 'REFUNDED' WHERE id = $1`,
            [bookingId]
        );

        await client.query(
            `UPDATE payments SET status = 'REFUNDED' WHERE booking_id = $1`,
            [bookingId]
        );

        await client.query("COMMIT");

        res.json({ message: "Booking cancelled and refund initiated successfully" });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
});


/*
================================================
USER BOOKINGS LIST
GET /api/bookings
================================================
*/
router.get("/", authenticate, async (req, res, next) => {
    try {
        const result = await pool.query(
            `
            SELECT
                b.id,
                b.pnr,
                b.status,
                b.payment_status,
                b.total_amount,
                b.journey_date,
                b.created_at,
                t.train_number,
                t.name AS train_name,
                fs.code AS from_code,
                ts.code AS to_code,
                c.code AS coach_code,
                c.class_code
            FROM bookings b
            JOIN train_trips tt ON tt.id = b.trip_id
            JOIN trains t ON t.id = tt.train_id
            JOIN stations fs ON fs.id = tt.from_station_id
            JOIN stations ts ON ts.id = tt.to_station_id
            JOIN coaches c ON c.id = b.coach_id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
            `,
            [req.user.id]
        );

        res.json(
            result.rows.map(row => ({
                id: row.id,
                pnr: row.pnr,
                status: row.status,
                paymentStatus: row.payment_status,
                totalAmount: Number(row.total_amount),
                journeyDate: row.journey_date,
                createdAt: row.created_at,
                train: {
                    number: row.train_number,
                    name: row.train_name
                },
                from: row.from_code,
                to: row.to_code,
                coach: row.coach_code,
                classCode: row.class_code
            }))
        );
    } catch (error) {
        next(error);
    }
});

export default router;