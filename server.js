const express = require("express");
const session = require("express-session");

require("./db");

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use(session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false
}));

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});