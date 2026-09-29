import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "railvista-production-jwt-secret-key-2026";

export function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}