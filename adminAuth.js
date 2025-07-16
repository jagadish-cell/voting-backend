require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 🔹 Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// ✅ 1. Admin Registration (One-time setup)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO admins (username, password_hash) VALUES ($1, $2)", [username, hashedPassword]);

        res.json({ message: "✅ Admin registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Error registering admin" });
    }
});

// ✅ 2. Admin Login (Returns JWT Token)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "❌ Invalid username or password" });
        }

        const admin = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, admin.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: "❌ Invalid username or password" });
        }

        const token = jwt.sign({ id: admin.id, role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ message: "✅ Login successful!", token });
    } catch (error) {
        res.status(500).json({ error: "❌ Error logging in" });
    }
});

// ✅ 3. Middleware to Verify Admin Token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(403).json({ message: "❌ No token provided" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "❌ Invalid token" });

        req.adminId = decoded.id;
        next();
    });
};

module.exports = { router, verifyAdmin };
