const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const axios = require("axios");
const bcrypt = require("bcrypt");

const app = express();

// ✅ MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}));

app.use(express.static("public"));

// ✅ DATABASE CONNECTION
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "quizgame"
});

db.connect((err) => {
    if (err) {
        console.log("❌ DB ERROR:", err);
    } else {
        console.log("✅ Database Connected");
    }
});

// ✅ AUTH CHECK
function checkAuth(req, res, next) {
    if (!req.session.userId) {
        return res.send("Please login first");
    }
    next();
}

// ======================
// ✅ REGISTER (FIXED)
// ======================
app.post("/auth/register", async (req, res) => {

    console.log("REGISTER HIT");

    const { username, password } = req.body;
    console.log("DATA:", username, password);

    if (!username || !password) {
        return res.send("Missing fields");
    }

    try {
        const hashed = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashed],
            (err, result) => {

                if (err) {
                    console.log("❌ DB ERROR:", err);
                    return res.send("User exists or DB error");
                }

                console.log("✅ USER INSERTED:", result);

                // redirect to login after register
                res.redirect("/login.html");
            }
        );

    } catch (err) {
        console.log("❌ SERVER ERROR:", err);
        res.send("Server error");
    }
});

// ======================
// ✅ LOGIN (FORM BASED - FIXED)
// ======================
app.post("/auth/login", (req, res) => {

    console.log("LOGIN HIT");

    const { username, password } = req.body;
    console.log("LOGIN DATA:", username, password);

    db.query(
        "SELECT * FROM users WHERE username=?",
        [username],
        async (err, result) => {

            if (err) {
                console.log("❌ DB ERROR:", err);
                return res.send("Database error");
            }

            if (result.length === 0) {
                console.log("❌ USER NOT FOUND");
                return res.send("Invalid login");
            }

            const user = result[0];

            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.userId = user.id;

                console.log("✅ LOGIN SUCCESS, USER ID:", user.id);

                res.redirect("/dashboard.html");

            } else {
                console.log("❌ PASSWORD WRONG");
                res.send("Invalid login");
            }
        }
    );
});

// ======================
// ✅ LOGOUT
// ======================
app.get("/auth/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

// ======================
// ✅ TEST SESSION
// ======================
app.get("/test-session", (req, res) => {
    console.log("SESSION CHECK:", req.session.userId);
    res.send("UserID: " + req.session.userId);
});

// ======================
// 🎮 GAME APIs
// ======================

// BANANA API
app.get("/game/banana", checkAuth, async (req, res) => {
    try {
        const r = await axios.get("https://marcconrad.com/uob/banana/api.php");
        res.json(r.data);
    } catch (err) {
        console.log("❌ BANANA API ERROR:", err);
        res.send("API error");
    }
});

// TRIVIA API
app.get("/game/trivia", checkAuth, async (req, res) => {
    try {
        const r = await axios.get("https://the-trivia-api.com/v2/questions");
        const q = r.data[0];

        res.json({
            question: q.question.text,
            correct: q.correctAnswer,
            answers: [...q.incorrectAnswers, q.correctAnswer].sort()
        });
    } catch (err) {
        console.log("❌ TRIVIA API ERROR:", err);
        res.send("API error");
    }
});

// ======================
// 🏆 SAVE SCORE
// ======================
app.post("/game/score", checkAuth, (req, res) => {

    const score = req.body.score;

    console.log("SCORE SAVE:", req.session.userId, score);

    db.query(
        "INSERT INTO scores (user_id, score) VALUES (?, ?)",
        [req.session.userId, score],
        (err) => {
            if (err) {
                console.log("❌ SCORE ERROR:", err);
                return res.send("Error saving score");
            }

            console.log("✅ SCORE SAVED");
            res.send("Saved");
        }
    );
});

// ======================
// 🏆 LEADERBOARD
// ======================
app.get("/game/leaderboard", (req, res) => {

    db.query(
        "SELECT users.username, scores.score FROM scores JOIN users ON users.id = scores.user_id ORDER BY score DESC LIMIT 10",
        (err, result) => {
            if (err) {
                console.log("❌ LEADERBOARD ERROR:", err);
                return res.send("Error");
            }

            res.json(result);
        }
    );
});

// ======================
// 🚀 START SERVER
// ======================
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});