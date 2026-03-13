const express=require("express");
const router=express.Router();
const db=require("../db");

router.post("/register",(req,res)=>{

const {username,password}=req.body;

db.query(

"INSERT INTO users(username,password) VALUES(?,?)",

[username,password],

(err)=>{

if(err){
res.json({success:false});
}else{
res.json({success:true});
}

}

);

});

router.post("/login",(req,res)=>{

const {username,password}=req.body;

db.query(

"SELECT * FROM users WHERE username=? AND password=?",

[username,password],

(err,result)=>{

if(result.length>0){

req.session.userId=result[0].id;

res.json({success:true});

}else{

res.json({success:false});

}

}

);

});

module.exports=router;