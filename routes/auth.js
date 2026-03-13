const express = require("express");
const router = express.Router();
const db = require("../db");

// REGISTER
router.post("/register",(req,res)=>{

const {username,password} = req.body;

const sql = "INSERT INTO users (username,password) VALUES (?,?)";

db.query(sql,[username,password],(err)=>{

if(err) return res.status(500).send(err);

res.send({message:"Registered successfully"});

});

});

// LOGIN
router.post("/login",(req,res)=>{

const {username,password} = req.body;

const sql = "SELECT * FROM users WHERE username=? AND password=?";

db.query(sql,[username,password],(err,result)=>{

if(err) return res.status(500).send(err);

if(result.length>0){

req.session.userId = result[0].id;

res.send({message:"Login success"});

}else{

res.status(401).send({message:"Invalid credentials"});

}

});

});

// LOGOUT
router.get("/logout",(req,res)=>{

req.session.destroy(()=>{
res.send({message:"Logged out"});
});

});

module.exports = router;