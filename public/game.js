let score = 0;

document.getElementById("startBtn").addEventListener("click", loadBananaQuestion);
document.getElementById("nextBtn").addEventListener("click", loadTriviaQuestion);

async function loadBananaQuestion() {
    const res = await fetch("/game/banana");
    const data = await res.json();

    document.getElementById("questionArea").innerHTML = `
        <h3>Banana Question</h3>
        <p>${data.question}</p>
        <input type="number" id="bananaAnswer">
        <button onclick="submitBanana(${data.solution})">Submit</button>
    `;
}

function submitBanana(correctAnswer) {
    const userAnswer = document.getElementById("bananaAnswer").value;

    if (parseInt(userAnswer) === correctAnswer) {
        score += 10;
        document.getElementById("score").innerText = score;
        alert("Correct!");
    } else {
        alert("Wrong! Correct answer: " + correctAnswer);
    }

    document.getElementById("nextBtn").style.display = "block";
}

async function loadTriviaQuestion() {
    const res = await fetch("/game/trivia");
    const data = await res.json();

    const question = data.results[0];
    const options = [...question.incorrect_answers, question.correct_answer];
    options.sort(() => Math.random() - 0.5);

    let html = `<h3>Trivia Question</h3>`;
    html += `<p>${question.question}</p>`;

    options.forEach(option => {
        html += `<button onclick="submitTrivia('${option}', '${question.correct_answer}')">${option}</button><br>`;
    });

    document.getElementById("questionArea").innerHTML = html;
}

function submitTrivia(selected, correct) {
    if (selected === correct) {
        score += 10;
        document.getElementById("score").innerText = score;
        alert("Correct!");
    } else {
        alert("Wrong! Correct answer: " + correct);
    }
}