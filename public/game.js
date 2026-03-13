let score = 0;
let questionType = "banana";
let timer;
let timeLeft = 15;

// start game when page loads
window.onload = function () {
    nextQuestion();
};

// ---------------- TIMER ----------------

function startTimer() {

    clearInterval(timer);

    timeLeft = 15;

    document.getElementById("timer").innerText = "Time: " + timeLeft;

    timer = setInterval(function () {

        timeLeft--;

        document.getElementById("timer").innerText = "Time: " + timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            gameOver();

        }

    }, 1000);
}

// ---------------- NEXT QUESTION ----------------

async function nextQuestion() {

    if (questionType === "banana") {

        await loadBananaQuestion();
        questionType = "trivia";

    } else {

        await loadTriviaQuestion();
        questionType = "banana";

    }

    startTimer();
}

// ---------------- BANANA QUESTION ----------------

async function loadBananaQuestion() {

    try {

        const res = await fetch("/game/banana");
        const data = await res.json();

        document.getElementById("questionArea").innerHTML = `
            <h3>Banana Puzzle</h3>
            <img src="${data.question}" width="250">
        `;

        document.getElementById("answers").innerHTML = `
            <input type="number" id="bananaAnswer" placeholder="Your answer">
            <br><br>
            <button onclick="submitBanana(${data.solution})">Submit</button>
        `;

    } catch (error) {

        console.log("Banana API error:", error);

    }
}

// ---------------- CHECK BANANA ANSWER ----------------

function submitBanana(solution) {

    const userAnswer = document.getElementById("bananaAnswer").value;

    if (userAnswer == solution) {

        score++;
        document.getElementById("correctSound").play();

    } else {

        document.getElementById("wrongSound").play();

    }

    document.getElementById("score").innerText = score;

    nextQuestion();
}

// ---------------- TRIVIA QUESTION ----------------

async function loadTriviaQuestion() {

    try {

        const res = await fetch("/game/trivia");
        const data = await res.json();

        document.getElementById("questionArea").innerHTML = `
            <h3>${data.question}</h3>
        `;

        let answersHTML = "";

        data.answers.forEach(function (answer) {

            answersHTML += `
                <button onclick="checkTrivia('${answer}','${data.correct}')">
                ${answer}
                </button><br><br>
            `;

        });

        document.getElementById("answers").innerHTML = answersHTML;

    } catch (error) {

        console.log("Trivia API error:", error);

    }
}

// ---------------- CHECK TRIVIA ANSWER ----------------

function checkTrivia(answer, correct) {

    if (answer === correct) {

        score++;
        document.getElementById("correctSound").play();

    } else {

        document.getElementById("wrongSound").play();

    }

    document.getElementById("score").innerText = score;

    nextQuestion();
}

// ---------------- GAME OVER ----------------

function gameOver() {

    clearInterval(timer);

    // save score locally
    localStorage.setItem("score", score);

    // send score to backend
    fetch("/game/score", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ score: score })
    });

    // go to game over page
    window.location.href = "gameover.html";
}