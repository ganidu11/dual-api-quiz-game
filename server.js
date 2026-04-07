const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const axios = require("axios");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true
}));

app.use(express.static("public"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "quizgame"
});
db.connect((err)=>{
    if(err){
        console.log("DB ERROR:", err);
    }else{
        console.log("Database Connected ✅");
    }
});


// AUTH CHECK
function checkAuth(req, res, next){
    if(!req.session.userId){
        return res.status(401).send("Login required");
    }
    next();
}

// REGISTER
app.post("/auth/register", async (req, res) => {

    const { username, password } = req.body;
    console.log("REGISTER DATA:", username,password);

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(password)) {
        console.log("Weak password");
        return res.send("Weak password");
    }

    try {
        const hashed = await bcrypt.hash(password, 10);

        console.log("Hashed:", hashed);

        db.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashed],
            (err) => {
                if (err) {
                    console.log("DB ERROR:", err);
                    return res.send("User exists");
                }

                console.log("User inserted successfully");
                res.send("Registered");
            }

        );
    } catch (err) {
        console.log("SERVER ERROR:", err);
        res.send("Error");
    }
});

// LOGIN
app.post("/auth/login", (req, res) => {

    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username=?",
        [username],
        async (err, result) => {

            if (result.length === 0)
                return res.send("Invalid");

            const user = result[0];

            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.userId = user.id;
                res.send("Success");
            } else {
                res.send("Invalid");
            }
        }
    );
});

// LOGOUT
app.get("/auth/logout", (req,res)=>{
    req.session.destroy(()=>{
        res.send("Logged out");
    });
});

// BANANA API
app.get("/game/banana", checkAuth, async (req,res)=>{
    try{
        const r = await axios.get("https://marcconrad.com/uob/banana/api.php");
        res.json(r.data);
    }catch{
        res.send("API error");
    }
});

// TRIVIA API
app.get("/game/trivia", checkAuth, async (req,res)=>{
    const r = await axios.get("https://the-trivia-api.com/v2/questions");
    const q = r.data[0];

    res.json({
        question: q.question.text,
        correct: q.correctAnswer,
        answers: [...q.incorrectAnswers, q.correctAnswer].sort()
    });
});

// SAVE SCORE
app.post("/game/score", checkAuth, (req,res)=>{
    const score = req.body.score;

    db.query(
        "INSERT INTO scores (user_id, score) VALUES (?,?)",
        [req.session.userId, score],
        ()=> res.send("Saved")
    );
});

// LEADERBOARD
app.get("/game/leaderboard", (req,res)=>{
    db.query(
        "SELECT users.username, scores.score FROM scores JOIN users ON users.id=scores.user_id ORDER BY score DESC LIMIT 10",
        (err,result)=> res.json(result)
    );
});

app.listen(3000, ()=> console.log("Server running"));