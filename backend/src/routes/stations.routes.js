import express from "express";
import { pool } from "../db.js";

const router = express.Router();


/*
GET /api/stations
*/

router.get("/", async (req, res, next) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                name,
                code,
                city
            FROM stations
            ORDER BY city, name
        `);

        res.json(result.rows);

    } catch (error) {

        next(error);

    }

});


/*
GET /api/stations/:code
*/

router.get("/:code", async (req, res, next) => {

    try {

        const { code } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                code,
                city
            FROM stations
            WHERE code = $1
            `,
            [code.toUpperCase()]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Station not found"
            });

        }

        res.json(result.rows[0]);

    } catch (error) {

        next(error);

    }

});


export default router;