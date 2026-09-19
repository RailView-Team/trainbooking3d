import express from "express";
import { pool } from "../db.js";

const router = express.Router();

function extractStations(text, allStations) {
    const clean = text.toLowerCase().replace(/[➔\->]+/g, ' to ');

    // 1. Try to find "from <origin> to <destination>" or "<origin> to <destination>"
    const fromToRegex = /(?:from\s+)?([a-z\s]+?)\s+(?:to|towards|for)\s+([a-z\s]+)/i;
    const match = clean.match(fromToRegex);

    const resolveStation = (phrase) => {
        if (!phrase) return null;
        const p = phrase.trim().toLowerCase();

        // Exact code with word boundary (e.g. \bhwh\b)
        for (const st of allStations) {
            const codeRegex = new RegExp(`\\b${st.code.toLowerCase()}\\b`, 'i');
            if (codeRegex.test(p)) return st;
        }

        // Match against stripped station name or city
        let best = null;
        let maxLen = 0;

        for (const st of allStations) {
            const nameClean = st.name.toLowerCase().replace(/\b(junction|central|terminus|railway station|city)\b/g, '').trim();
            const cityClean = st.city.toLowerCase().trim();

            if (nameClean && p.includes(nameClean) && nameClean.length > maxLen) {
                best = st;
                maxLen = nameClean.length;
            } else if (cityClean && p.includes(cityClean) && cityClean.length > maxLen) {
                best = st;
                maxLen = cityClean.length;
            }
        }
        return best;
    };

    let fromSt = null;
    let toSt = null;

    if (match) {
        fromSt = resolveStation(match[1]);
        toSt = resolveStation(match[2]);
    }

    // Fallback: look anywhere in the text using word boundaries
    if (!fromSt || !toSt) {
        for (const st of allStations) {
            const nameClean = st.name.toLowerCase().replace(/\b(junction|central|terminus|railway station|city)\b/g, '').trim();
            const codeRegex = new RegExp(`\\b${st.code.toLowerCase()}\\b`, 'i');
            const nameRegex = nameClean ? new RegExp(`\\b${nameClean}\\b`, 'i') : null;

            if (codeRegex.test(clean) || (nameRegex && nameRegex.test(clean))) {
                if (!fromSt) fromSt = st;
                else if (!toSt && fromSt.code !== st.code) toSt = st;
            }
        }
    }

    return { fromSt, toSt };
}

/*
================================================
RAILVIEW CHATBOT ROUTE
POST /api/chat
================================================
*/
router.post("/", async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({ message: "Message is required" });
        }

        const query = message.trim();
        const lower = query.toLowerCase();

        // 1. PNR Status Check
        const pnrMatch = query.match(/\b([A-Z0-9]{8,12})\b/i);
        if (lower.includes("pnr") || (lower.includes("ticket") && pnrMatch)) {
            let pnr = null;
            if (pnrMatch && pnrMatch[1].toUpperCase() !== "STATUS" && pnrMatch[1].toUpperCase() !== "CHECK") {
                pnr = pnrMatch[1].toUpperCase();
            }

            if (pnr) {
                const bookingResult = await pool.query(
                    `
                    SELECT
                        b.id, b.pnr, b.status, b.payment_status, b.total_amount, b.journey_date,
                        t.name AS train_name, t.train_number,
                        fs.name AS from_name, fs.code AS from_code,
                        ts.name AS to_name, ts.code AS to_code,
                        c.code AS coach_code, c.class_name
                    FROM bookings b
                    JOIN train_trips tt ON tt.id = b.trip_id
                    JOIN trains t ON t.id = tt.train_id
                    JOIN stations fs ON fs.id = tt.from_station_id
                    JOIN stations ts ON ts.id = tt.to_station_id
                    JOIN coaches c ON c.id = b.coach_id
                    WHERE b.pnr = $1
                    LIMIT 1
                    `,
                    [pnr]
                );

                if (bookingResult.rows.length > 0) {
                    const b = bookingResult.rows[0];
                    const seatsRes = await pool.query(
                        `SELECT s.seat_number, s.berth_type FROM booking_seats bs JOIN seats s ON s.id = bs.seat_id WHERE bs.booking_id = $1`,
                        [b.id]
                    );
                    const seatList = seatsRes.rows.map(s => `${s.seat_number} (${s.berth_type})`).join(", ");

                    return res.json({
                        reply: `🚆 **PNR Status for ${b.pnr}**\n\n• **Train:** ${b.train_number} - ${b.train_name}\n• **Route:** ${b.from_name} (${b.from_code}) ➔ ${b.to_name} (${b.to_code})\n• **Date of Journey:** ${new Date(b.journey_date).toLocaleDateString()}\n• **Booking Status:** **${b.status}** (Payment: ${b.payment_status})\n• **Coach:** ${b.coach_code} (${b.class_name})\n• **Seats:** ${seatList || "Assigned"}\n• **Total Fare:** ₹${b.total_amount}`,
                        actions: [{ label: "View Ticket Slip", url: `/booking/confirmation?pnr=${b.pnr}` }]
                    });
                } else {
                    return res.json({
                        reply: `I searched our database for PNR **${pnr}**, but no booking was found. Please check your 10-digit reservation number and try again.`
                    });
                }
            } else {
                return res.json({
                    reply: `To check your live booking status, please provide your 10-character PNR number (e.g. "Check PNR 8492749102").`
                });
            }
        }

        // 2. Train Search & Timings
        const stationsRes = await pool.query(`SELECT code, name, city FROM stations`);
        const { fromSt, toSt } = extractStations(query, stationsRes.rows);

        if (fromSt && toSt) {
            const trainsResult = await pool.query(
                `
                WITH direct_matches AS (
                    SELECT
                        t.id AS train_id,
                        t.train_number, t.name, t.train_type, t.status,
                        tt.departure_time, tt.arrival_time, tt.duration_minutes
                    FROM train_trips tt
                    JOIN trains t ON t.id = tt.train_id
                    JOIN stations fs ON fs.id = tt.from_station_id
                    JOIN stations ts ON ts.id = tt.to_station_id
                    WHERE fs.code = $1 AND ts.code = $2
                ),
                stop_matches AS (
                    SELECT
                        t.id AS train_id,
                        t.train_number, t.name, t.train_type, t.status,
                        COALESCE(rs_from.departure_time, tt.departure_time) AS departure_time,
                        COALESCE(rs_to.arrival_time, tt.arrival_time) AS arrival_time,
                        CASE
                            WHEN rs_from.departure_time IS NOT NULL AND rs_to.arrival_time IS NOT NULL
                            THEN EXTRACT(EPOCH FROM (rs_to.arrival_time - rs_from.departure_time)) / 60
                            ELSE tt.duration_minutes
                        END::integer AS duration_minutes
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
                WHERE train_number NOT IN (SELECT train_number FROM stop_matches)
                ORDER BY departure_time
                LIMIT 4
                `,
                [fromSt.code, toSt.code]
            );

            if (trainsResult.rows.length > 0) {
                const trainList = trainsResult.rows.map(tr => {
                    const dep = tr.departure_time ? tr.departure_time.slice(0, 5) : "--:--";
                    const arr = tr.arrival_time ? tr.arrival_time.slice(0, 5) : "--:--";
                    return `• **${tr.train_number} - ${tr.name}** (${tr.train_type || 'Superfast'})\n  Departure: **${dep}** | Arrival: **${arr}** | Status: **${tr.status}**`;
                }).join("\n\n");

                return res.json({
                    reply: `Found **${trainsResult.rows.length} train(s)** connecting **${fromSt.name} (${fromSt.code})** and **${toSt.name} (${toSt.code})**:\n\n${trainList}\n\nWould you like to select travel classes or preview coaches in 3D?`,
                    actions: [
                        {
                            label: `Book ${fromSt.code} ➔ ${toSt.code}`,
                            url: `/trains?from=${fromSt.code}&to=${toSt.code}`
                        }
                    ]
                });
            } else {
                return res.json({
                    reply: `There are currently no direct trains connecting **${fromSt.name} (${fromSt.code})** to **${toSt.name} (${toSt.code})** in our schedule.\n\nYou can search for trains to major intermediate junctions like New Delhi (NDLS), Kanpur (CNB), or Dhanbad (DHN).`
                });
            }
        }

        // 3. Vande Bharat Features
        if (lower.includes("vande bharat") || lower.includes("22436") || lower.includes("features") || lower.includes("amenities")) {
            const vbResult = await pool.query(`SELECT * FROM trains WHERE train_number = '22436' LIMIT 1`);
            const vb = vbResult.rows[0];
            return res.json({
                reply: `🚄 **${vb?.name || 'Vande Bharat Express'} (Train #22436)**\n\n• **Speed:** Semi-high speed train running up to 160 km/h\n• **Seating:** 180° rotatable executive plush chairs with personal reading lights\n• **Amenities:** Free high-speed WiFi, GPS infotainment displays, bio-vacuum toilets, CCTV surveillance\n• **Route:** New Delhi (NDLS) ➔ Kanpur Central (CNB) ➔ Prayagraj (PRYJ) ➔ Varanasi (BSB)\n\nExperience the coach right now in our **First-Person 3D Walkthrough View**!`,
                actions: [
                    { label: "Experience 3D Coach", url: `/trains/1/class?from=NDLS&to=BSB` }
                ]
            });
        }

        // 4. Ticket Cancellation & Refund Guidelines
        if (lower.includes("cancel") || lower.includes("refund") || lower.includes("charge")) {
            return res.json({
                reply: `📋 **IRCTC & RailView Ticket Cancellation Guidelines:**\n\n1. **Confirmed Tickets:**\n   • 48+ hours before departure: Flat deduction per passenger (₹240 for 1A/EC, ₹200 for 2A, ₹180 for 3A/CC, ₹120 for SL).\n   • 12 to 48 hours before: 25% deduction of base fare.\n   • 4 to 12 hours before: 50% deduction of base fare.\n2. **Instant Cancellation:** You can cancel any reservation directly under the **My Bookings** tab.\n3. **Automated Refund:** Refund amounts are initiated instantly to your original payment mode.`
            });
        }

        // 5. Travel Classes Explanation (1A, 2A, 3A, CC, EC, SL)
        if (lower.includes("class") || lower.includes("difference") || lower.includes("1a") || lower.includes("2a") || lower.includes("3a") || lower.includes("berth") || lower.includes("sleeper")) {
            return res.json({
                reply: `🛋️ **Train Classes on RailView:**\n\n• **1A (First AC):** Luxury 2-berth lockable Coupes and 4-berth Cabins with attendant call button and fresh linens.\n• **2A (2-Tier AC):** Air-conditioned sleeper with 2 tiers (Lower & Upper) and privacy curtains.\n• **3A (3-Tier AC):** Budget-friendly AC sleeper with 3 tiers (Lower, Middle, Upper + Side berths) with bedding.\n• **CC (AC Chair Car):** 3x2 reclining push-back chairs for fast day journeys.\n• **EC (Executive Chair):** 2x2 wide luxury seats with extra legroom and meal service.\n• **SL (Sleeper):** Traditional 3-tier non-AC sleeper berths.\n\nAll seats can be inspected in our **Interactive 3D Walkthrough** before booking!`
            });
        }

        // 6. Helpful Greetings & Default Fallback
        if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey") || lower.includes("help") || lower.includes("namaste")) {
            return res.json({
                reply: `Namaste! I am **RailBot**, your RailView Railway Travel Assistant 🚆.\n\nHere is how I can assist you:\n• **Find Trains:** e.g. *"Find trains from Howrah to New Delhi"*\n• **Check PNR:** e.g. *"Check status of PNR 8492749102"*\n• **Coach Classes:** e.g. *"Difference between 2A and 3A"*\n• **Train Highlights:** e.g. *"Vande Bharat features"*\n• **Cancellation Rules:** e.g. *"How to cancel ticket"*`
            });
        }

        return res.json({
            reply: `I can help you search trains, check PNR status, explain coach layouts, or provide IRCTC refund rules.\n\nTry asking: *"Find trains from Howrah to New Delhi"* or *"Check PNR 8492749102"*!`
        });

    } catch (error) {
        next(error);
    }
});

export default router;
