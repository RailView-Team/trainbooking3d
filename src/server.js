import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { pool } from "./db.js";

import stationsRoutes
    from "./routes/stations.routes.js";

import trainsRoutes
    from "./routes/trains.routes.js";

import authRoutes
    from "./routes/auth.routes.js";

import bookingsRoutes
    from "./routes/bookings.routes.js";

import { errorHandler }
    from "./middleware/errorHandler.js";


dotenv.config();


const app = express();

const PORT =
    process.env.PORT || 3000;


/*
==========================================
MIDDLEWARE
==========================================
*/

app.use(helmet());

app.use(
    cors({
        origin:
            process.env.CORS_ORIGIN
            || "http://localhost:5173"
    })
);

app.use(express.json());

app.use(morgan("dev"));


/*
==========================================
HEALTH CHECK
==========================================
*/

app.get("/api/health", async (req, res) => {

    try {

        await pool.query("SELECT 1");

        res.json({

            status: "OK",

            message:
                "AeroRail backend is running",

            database:
                "connected"

        });

    } catch (error) {

        res.status(500).json({

            status: "ERROR",

            database:
                "disconnected"

        });

    }

});


/*
==========================================
API ROUTES
==========================================
*/

app.use(
    "/api/stations",
    stationsRoutes
);


app.use(
    "/api/trains",
    trainsRoutes
);


app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/bookings",
    bookingsRoutes
);


/*
==========================================
404
==========================================
*/

app.use((req, res) => {

    res.status(404).json({

        message:
            "API endpoint not found",

        path:
            req.originalUrl

    });

});


/*
==========================================
ERROR HANDLER
==========================================
*/

app.use(errorHandler);


/*
==========================================
START SERVER
==========================================
*/

app.listen(PORT, () => {

    console.log(
        `AeroRail backend running on http://localhost:${PORT}`
    );

});