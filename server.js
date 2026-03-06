const express = require("express");
const session = require("express-session");

// Connect to database
require("./db");

// Import routes
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");

const app = express();

// Middleware
app.use(express.json()); // Parse JSON body
app.use(express.static("public")); // Serve frontend files

app.use(session({
    secret: "supersecretkey", // Change later for security
    resave: false,
    saveUninitialized: false
}));

// Routes
app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

// Default route
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});