//used AI for get codes.

let score=0;
let questionType="banana";
let timer;
let timeLeft=15;

startGame();

function startGame(){
nextQuestion();
}

function startTimer(){

clearInterval(timer);

timeLeft=15;

document.getElementById("timer").innerText=timeLeft;

timer=setInterval(()=>{

timeLeft--;

document.getElementById("timer").innerText=timeLeft;

if(timeLeft<=0){

clearInterval(timer);

gameOver();

}

},1000);

}

async function nextQuestion(){

if(questionType==="banana"){
await bananaQuestion();
questionType="trivia";
}else{
await triviaQuestion();
questionType="banana";
}

startTimer();

}

async function bananaQuestion(){

const res=await fetch("/game/banana");

const data=await res.json();

document.getElementById("questionArea").innerHTML=
`<img src="${data.question}" width="250">`;

document.getElementById("answers").innerHTML=
`
<input id="bananaAnswer">
<button onclick="submitBanana(${data.solution})">Submit</button>
`;

}

function submitBanana(solution){

let ans=document.getElementById("bananaAnswer").value;

if(ans==solution){

score++;

document.getElementById("correctSound").play();

}else{

document.getElementById("wrongSound").play();

}

document.getElementById("score").innerText=score;

nextQuestion();

}

async function triviaQuestion(){

const res=await fetch("/game/trivia");

const data=await res.json();

document.getElementById("questionArea").innerHTML=
`<h3>${data.question}</h3>`;

let html="";

data.answers.forEach(a=>{

html+=`<button onclick="checkTrivia('${a}','${data.correct}')">${a}</button>`;

});

document.getElementById("answers").innerHTML=html;

}

function checkTrivia(ans,correct){

if(ans===correct){

score++;

document.getElementById("correctSound").play();

}else{

document.getElementById("wrongSound").play();

}

document.getElementById("score").innerText=score;

nextQuestion();

}

function gameOver(){

localStorage.setItem("score",score);

window.location.href="gameover.html";

}