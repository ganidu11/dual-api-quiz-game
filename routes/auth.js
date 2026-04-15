//used AI for get codes.

const express = require("express");
const router = express.Router();
const db = require("../db");

// REGISTER
router.post("/register",(req,res)=>{

const username = req.body.username.trim();
const password = req.body.password.trim();

const checkUser = "SELECT * FROM users WHERE username = ?";

db.query(checkUser,[username],(err,result)=>{

if(err) return res.status(500).send(err);

if(result.length > 0){

return res.json({success:false,message:"User already exists"});

}

const sql = "INSERT INTO users (username,password) VALUES (?,?)";

db.query(sql,[username,password],(err)=>{

if(err) return res.status(500).send(err);

res.json({success:true});

});

});

});

// LOGIN
router.post("/login",(req,res)=>{

const username = req.body.username.trim();
const password = req.body.password.trim();

const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

db.query(sql,[username,password],(err,result)=>{

if(err){
return res.status(500).send(err);
}

if(result.length > 0){

req.session.userId = result[0].id;

res.json({success:true});

}else{

res.json({success:false,message:"Invalid username or password"});

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