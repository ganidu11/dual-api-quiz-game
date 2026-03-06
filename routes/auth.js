const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        (err) => {
            if (err) {
                return res.status(500).send("Registration failed");
            }
            res.send("User registered successfully");
        }
    );
});

// Login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, results) => {
            if (results.length === 0) {
                return res.status(400).send("User not found");
            }

            const user = results[0];
            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.status(401).send("Invalid password");
            }

            req.session.userId = user.id;
            res.send("Login successful");
        }
    );
});

module.exports = router;