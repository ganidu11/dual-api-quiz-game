//used AI for get codes.

// 🔊 PRELOAD GAME OVER SOUND
const gameOverSound = new Audio("sounds/gameover.mp3");
gameOverSound.preload = "auto";

let score = 0;
let level = 1;
let questionType = "banana";
let timer;

let difficulty = localStorage.getItem("difficulty") || "easy";

// SET DIFFICULTY IN UI
window.onload = ()=>{
document.getElementById("diff").innerText = difficulty;
nextQuestion();
};

// TIMER
function startTimer(){
clearInterval(timer);

let timeLeft;

// ✅ TIMER BASED ON DIFFICULTY
if(difficulty === "easy") timeLeft = 15;
if(difficulty === "medium") timeLeft = 10;
if(difficulty === "hard") timeLeft = 7;

let totalTime = timeLeft;

timer = setInterval(()=>{
timeLeft--;

let progress = document.getElementById("timerProgress");

// update width
progress.style.width = (timeLeft/totalTime)*100 + "%";

// 🔥 turn red in last 5 seconds
if(timeLeft <= totalTime/3){
progress.style.background = "#ff0033";
}else{
progress.style.background = "linear-gradient(90deg,#00f7ff,#9d00ff)";
}

if(timeLeft<=0){
clearInterval(timer);
gameOver();
}

},1000);
}

// LOADER
function showLoader(show){
document.getElementById("loader").style.display = show?"block":"none";
}

// NEXT QUESTION
async function nextQuestion(){

showLoader(true);

setTimeout(async()=>{

if(questionType==="banana"){
await loadBanana();
questionType="trivia";
}else{
await loadTrivia();
questionType="banana";
}

showLoader(false);
startTimer();

},800);
}

// BANANA
async function loadBanana(){
const res = await fetch("/game/banana", {
    credentials: "include"
});
const data = await res.json();

document.getElementById("questionArea").innerHTML =
`<img src="${data.question}" width="250">`;

document.getElementById("answers").innerHTML =
`<input id="bananaAns" type="number">
<button onclick="checkBanana(${data.solution})">Submit</button>`;
}

// TRIVIA
async function loadTrivia(){
const res = await fetch("/game/trivia", {
    credentials: "include"
});
const data = await res.json();

let html="";
data.answers.forEach(a=>{
html+=`<button onclick="checkTrivia('${a}','${data.correct}',this)">${a}</button>`;
});

document.getElementById("questionArea").innerText = data.question;
document.getElementById("answers").innerHTML = html;
}

// CHECK
function checkBanana(ans){
let val=document.getElementById("bananaAns").value;

if(val==ans){
correct();
}else{
wrong();
}
nextQuestion();
}

function checkTrivia(a,c,btn){
animate(btn);

if(a===c){
correct();
}else{
wrong();
}
nextQuestion();
}

// EFFECTS
function correct(){
    let points = 1;


if(difficulty === "medium") points = 2;
if(difficulty === "hard") points = 3;

score += points;

update();
flash("#00ffcc");
document.getElementById("correctSound").play();
}

function wrong(){
flash("#ff0033");
document.getElementById("wrongSound").play();
}

function flash(color){
document.body.style.background=color;
setTimeout(()=>document.body.style.background="",200);
}

function animate(btn){
btn.style.transform="scale(0.9)";
setTimeout(()=>btn.style.transform="scale(1)",100);
}

// UPDATE
function update(){
document.getElementById("score").innerText=score;

if(score%5===0){
level++;
document.getElementById("level").innerText=level;
}
}

// MUSIC
function toggleMusic(){
let m=document.getElementById("bgMusic");
m.paused?m.play():m.pause();
}

// GAME OVER
function gameOver(){

clearInterval(timer);

// 🔊 PLAY SOUND (this WILL work because user is already interacting)
const sound = new Audio("sounds/gameover.mp3");
sound.currentTime = 0;
sound.volume = 1;
sound.play().catch(err => console.log(err));

// SAVE SCORE
localStorage.setItem("score",score);

// 🎮 SHOW GAME OVER UI INSIDE SAME PAGE
document.body.innerHTML = `
<div class="center-screen glass">
    <h1 class="title">GAME OVER</h1>
    <h2>Your Score: ${score}</h2>
    <button onclick="goDashboard()">Play Again</button>
</div>
`;

// SAVE SCORE TO DB
fetch("/game/score",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({score:score})
});

}
function goDashboard(){
window.location.href = "dashboard.html";
}