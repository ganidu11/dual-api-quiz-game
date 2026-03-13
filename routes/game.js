const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db");


// ---------------- BANANA API ----------------

router.get("/banana", async (req, res) => {

    try {

        const response = await axios.get("https://marcconrad.com/uob/banana/api.php");

        const data = response.data;

        res.json({
            question: data.question,
            solution: data.solution
        });

    } catch (error) {

        console.log("Banana API error:", error);

        res.status(500).json({
            error: "Failed to fetch banana question"
        });

    }

});


// ---------------- TRIVIA API ----------------

router.get("/trivia", async (req, res) => {

    try {

        const response = await axios.get("https://the-trivia-api.com/api/questions?limit=1");

        const q = response.data[0];

        const answers = [...q.incorrectAnswers, q.correctAnswer];

        // shuffle answers
        answers.sort(() => Math.random() - 0.5);

        res.json({
            question: q.question,
            answers: answers,
            correct: q.correctAnswer
        });

    } catch (error) {

        console.log("Trivia API error:", error);

        res.status(500).json({
            error: "Failed to fetch trivia question"
        });

    }

});


// ---------------- SAVE SCORE ----------------

router.post("/score", (req, res) => {

    const { score } = req.body;

    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }

    db.query(
        "INSERT INTO scores (user_id, score) VALUES (?, ?)",
        [userId, score],
        (err) => {

            if (err) {

                console.log(err);

                res.status(500).json({
                    error: "Failed to save score"
                });

            } else {

                res.json({
                    success: true
                });

            }

        }
    );

});


// ---------------- GET LEADERBOARD ----------------

router.get("/leaderboard", (req, res) => {

    db.query(

        `SELECT users.username, scores.score
         FROM scores
         JOIN users ON scores.user_id = users.id
         ORDER BY scores.score DESC
         LIMIT 10`,

        (err, results) => {

            if (err) {

                res.status(500).json({
                    error: "Leaderboard error"
                });

            } else {

                res.json(results);

            }

        }

    );

});


module.exports = router;