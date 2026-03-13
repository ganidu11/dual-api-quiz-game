const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db");

// BANANA QUESTION
router.get("/banana", async (req,res)=>{

try{

const response = await axios.get("https://marcconrad.com/uob/banana/api.php");

res.json({
question: response.data.question,
solution: response.data.solution
});

}catch(err){

res.status(500).send(err);

}

});

// TRIVIA QUESTION
router.get("/trivia", async (req,res)=>{

try{

const response = await axios.get("https://the-trivia-api.com/v2/questions?limit=1");

const q = response.data[0];

const answers = [...q.incorrectAnswers, q.correctAnswer];

answers.sort(()=>Math.random()-0.5);

res.json({
question: q.question.text,
answers: answers,
correct: q.correctAnswer
});

}catch(err){

res.status(500).send(err);

}

});

// SAVE SCORE
router.post("/score",(req,res)=>{

if(!req.session.userId){
return res.status(401).send("Not logged in");
}

const score = req.body.score;

const sql = "INSERT INTO scores (user_id,score) VALUES (?,?)";

db.query(sql,[req.session.userId,score],(err)=>{

if(err) return res.status(500).send(err);

res.send("Score saved");

});

});

// LEADERBOARD
router.get("/leaderboard",(req,res)=>{

const sql = `
SELECT users.username, scores.score
FROM scores
JOIN users ON scores.user_id = users.id
ORDER BY scores.score DESC
LIMIT 10
`;

db.query(sql,(err,result)=>{

if(err) return res.status(500).json(err);

res.json(result);

});

});

module.exports = router;