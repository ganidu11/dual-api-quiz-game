const express = require("express");
const axios = require("axios");

const router = express.Router();

// Middleware to check login
function checkAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).send("Unauthorized. Please login.");
    }
    next();
}

// Banana API Route
router.get("/banana", checkAuth, async (req, res) => {
    try {
        const response = await axios.get("https://marcconrad.com/uob/banana/api.php");
        res.json(response.data);
    } catch (err) {
        res.status(500).send("Banana API error");
    }
});

// Trivia API Route
router.get("/trivia", checkAuth, async (req, res) => {
    try {
        const response = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
        res.json(response.data);
    } catch (err) {
        res.status(500).send("Trivia API error");
    }
});

module.exports = router;