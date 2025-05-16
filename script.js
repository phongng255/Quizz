let questions = [];
let currentQuestionIndex = 0;
let score = 0;
// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// Load questions and shuffle them
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        shuffleArray(questions); // Shuffle questions
        displayQuestion();
    })
    .catch(error => console.error('Error loading questions:', error));
function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        const questionContainer = document.getElementById('question-container');

        let questionContent = '';
        if (question.question) {
            questionContent = `<h2>Question ${currentQuestionIndex + 1}: ${question.question}</h2>`;
        } else if (question.image) {
            questionContent = `
                <h2>Question ${currentQuestionIndex + 1}:</h2>
                <img src="${question.image}" alt="Question Image">
            `;
        }

        questionContainer.innerHTML = `
            ${questionContent}
            <div id="options">
                ${question.options.map((option, index) => 
                    `<label>
                        <input type="radio" name="answer" value="${option}"> ${option}
                    </label><br>`
                ).join('')}
            </div>
            <button id="confirm-button" onclick="checkAnswer()">Confirm</button>
        `;
    } else {
        showResult(); // Call function to display results
    }
}
function updateResult() {
    const totalQuestionsElement = document.getElementById('total-questions');
    const correctAnswersElement = document.getElementById('correct-answers');
    const wrongAnswersElement = document.getElementById('wrong-answers');
    const resultTableBody = document.querySelector('#result-table tbody');
    // Calculate the number of incorrect answers
    const wrongAnswers = Math.max(0, currentQuestionIndex - score);
    // Update summary information
    totalQuestionsElement.textContent = questions.length;
    correctAnswersElement.textContent = score;
    wrongAnswersElement.textContent = wrongAnswers;
    // Clear old content in the detailed table
    resultTableBody.innerHTML = '';
    // Add each question and result to the detailed table
    questions.forEach((question, index) => {
        if (index >= currentQuestionIndex) return; // Only display answered questions
        const userAnswer = question.userAnswer || 'No answer';
        const correctAnswer = question.answer;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${question.question}</td>
            <td style="color: ${userAnswer === correctAnswer ? 'green' : 'red'};">${userAnswer}</td>
            <td>${correctAnswer}</td>
        `;
        resultTableBody.appendChild(row);
    });
}
function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
        alert('Please select an answer!');
        return;
    }
    const userAnswer = selectedOption.value;
    const correctAnswer = questions[currentQuestionIndex].answer;
    // Save the user's answer
    questions[currentQuestionIndex].userAnswer = userAnswer;
    // Highlight correct and incorrect answers
    const options = document.querySelectorAll('input[name="answer"]');
    options.forEach(option => {
        if (option.value === correctAnswer) {
            option.parentElement.style.color = 'green';
        }
    });
    if (userAnswer !== correctAnswer) {
        selectedOption.parentElement.style.color = 'red';
    } else {
        score++;
    }
    // Disable options and change Confirm button to Next
    options.forEach(option => option.disabled = true);
    const confirmButton = document.getElementById('confirm-button');
    confirmButton.textContent = 'Next';
    confirmButton.onclick = () => {
        currentQuestionIndex++;
        displayQuestion();
        updateResult(); // Update results after each question
    };
    // Update results immediately after answering
    updateResult();
}
function showResult() {
    const resultContainer = document.getElementById('result-container');
    const scoreElement = document.getElementById('score');
    const resultTableBody = document.querySelector('#result-table tbody');
    const totalQuestionsElement = document.getElementById('total-questions');
    const correctAnswersElement = document.getElementById('correct-answers');
    const wrongAnswersElement = document.getElementById('wrong-answers');

    // Clear old content
    resultTableBody.innerHTML = '';

    const wrongAnswers = questions.length - score;
    totalQuestionsElement.textContent = questions.length;
    correctAnswersElement.textContent = score;
    wrongAnswersElement.textContent = wrongAnswers;

    questions.forEach((question, index) => {
        const userAnswer = question.userAnswer || 'No answer';
        const correctAnswer = question.answer;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${question.question}</td>
            <td style="color: ${userAnswer === correctAnswer ? 'green' : 'red'};">${userAnswer}</td>
            <td>${correctAnswer}</td>
        `;
        resultTableBody.appendChild(row);
    });

    scoreElement.textContent = `You answered correctly ${score} / ${questions.length} questions.`;

    document.getElementById('quiz-container').style.display = 'none';
    resultContainer.style.display = 'block';
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    displayQuestion();
}
function sortTable(columnIndex) {
    const table = document.getElementById("result-table");
    const rows = Array.from(table.rows).slice(1); // Get all rows except the header
    const isAscending = table.getAttribute("data-sort-order") === "asc";
    // Sort rows
    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex];
        const cellB = rowB.cells[columnIndex];
        // Get the color of the cell
        const colorA = window.getComputedStyle(cellA).color;
        const colorB = window.getComputedStyle(cellB).color;
        // Define color order (green first, red second)
        const colorOrder = {
            "rgb(0, 128, 0)": 1, // Green
            "rgb(255, 0, 0)": 2, // Red
            "rgb(0, 0, 0)": 3    // Black (or no color)
        };
        const valueA = colorOrder[colorA] || 3; // Default to 3 if not matched
        const valueB = colorOrder[colorB] || 3;
        return isAscending ? valueA - valueB : valueB - valueA;
    });
    // Toggle sort order
    table.setAttribute("data-sort-order", isAscending ? "desc" : "asc");
    // Reattach sorted rows to the table
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // Clear old content
    rows.forEach(row => tbody.appendChild(row));
}