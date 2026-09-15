import express from "express";
import bcrypt from "bcryptjs";

import { pool } from "../db.js";
import { generateToken } from "../utils/jwt.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();


/*
==========================================
REGISTER
==========================================
*/

router.post("/register", async (req, res, next) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "name, email and password are required"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters"
            });

        }


        const existingUser =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE email = $1
                `,
                [email.toLowerCase()]
            );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                message: "Email already registered"
            });

        }


        const passwordHash =
            await bcrypt.hash(password, 10);


        const result =
            await pool.query(
                `
                INSERT INTO users
                (
                    name,
                    email,
                    password_hash
                )

                VALUES
                ($1, $2, $3)

                RETURNING
                    id,
                    name,
                    email
                `,
                [
                    name,
                    email.toLowerCase(),
                    passwordHash
                ]
            );


        const user = result.rows[0];


        const token =
            generateToken(user);


        res.status(201).json({

            message: "Registration successful",

            token,

            user

        });

    } catch (error) {

        next(error);

    }

});


/*
==========================================
LOGIN
==========================================
*/

router.post("/login", async (req, res, next) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message:
                    "email and password are required"
            });

        }


        const result =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    email,
                    password_hash
                FROM users
                WHERE email = $1
                `,
                [email.toLowerCase()]
            );


        if (result.rows.length === 0) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }


        const user = result.rows[0];


        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!validPassword) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }


        delete user.password_hash;


        const token =
            generateToken(user);


        res.json({

            message: "Login successful",

            token,

            user

        });

    } catch (error) {

        next(error);

    }

});


/*
==========================================
CURRENT USER
==========================================
*/

router.get(
    "/me",
    authenticate,
    async (req, res, next) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        created_at
                    FROM users
                    WHERE id = $1
                    `,
                    [req.user.id]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    message: "User not found"
                });

            }


            res.json(result.rows[0]);

        } catch (error) {

            next(error);

        }

    }
);


export default router;