const express = require("express");
const session = require("express-session");
const path = require("path");

require("./db");

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));

app.use(session({
    secret:"quizsecret",
    resave:false,
    saveUninitialized:false
}));

app.use("/auth",authRoutes);
app.use("/game",gameRoutes);

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"public/home.html"));
});

app.listen(3000,()=>{
    console.log("Server running on http://localhost:3000");
});