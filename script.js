let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let lastQuestionIndex = 0; // Thêm biến này ở đầu file
 
// // Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shuffleArrayOption(array) {
    const shuffled = array.slice(); // copy để giữ mảng gốc
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Load questions and shuffle them
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        shuffleArray(questions); // Shuffle questions
        displayQuestion();
        renderQuestionList();
        updateResult();
    })
    .catch(error => console.error('Error loading questions:', error));
 
function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        const questionContainer = document.getElementById('question-container');

        const shuffledOptions = shuffleArrayOption(question.options); // Shuffle Option

        let questionContent = '';
        if (question.question) {
            questionContent = `<h2>Question ${currentQuestionIndex + 1}: ${question.question}</h2>`;
        } else {
            questionContent = `<h2>Question ${currentQuestionIndex + 1}:</h2><img src="${question.image}" alt="Question Image">`;
        }

        questionContainer.innerHTML = `
            ${questionContent}
            <div id="options">
                ${shuffledOptions.map((option, index) =>
                    `<label>
                        <input type="radio" name="answer" value="${option}"> ${option}
                    </label><br>`
                ).join('')}
            </div>
            <button id="confirm-button" onclick="checkAnswer()">Confirm</button>
        `;
    } else {
        showResult();
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
            <td class="clickable-question" data-index="${index}" style="cursor:pointer; text-decoration:underline;">${question.question ? question.question : '<img src="' + question.image + '" alt="Question Image" style="max-width:100px;vertical-align:middle;">'}</td>
            <td style="color: ${userAnswer === correctAnswer ? 'green' : 'red'};">${userAnswer}</td>
            <td>${correctAnswer}</td>
        `;
        resultTableBody.appendChild(row);
    });
 
    // Add click event for each question cell
    document.querySelectorAll('.clickable-question').forEach(cell => {
        cell.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            showAnsweredQuestion(idx);
        });
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
        renderQuestionList();
        updateResult(); // Update results after each question
    };
 
    // Update results immediately after answering
    updateResult();
}
 
function showResult() {
    console.log('Displaying results');
    console.log('Total questions:', questions.length);
    console.log('Correct answers:', score);

    const resultContainer = document.getElementById('result-container');
    const scoreElement = document.getElementById('score');
    const resultTableBody = document.querySelector('#result-table tbody');
    const totalQuestionsElement = document.getElementById('total-questions');
    const correctAnswersElement = document.getElementById('correct-answers');
    const wrongAnswersElement = document.getElementById('wrong-answers');

    // Clear old content in the detailed table (if any)
    resultTableBody.innerHTML = '';

    // Calculate the number of incorrect answers
    const wrongAnswers = questions.length - score;

    // Display summary information
    totalQuestionsElement.textContent = questions.length;
    correctAnswersElement.textContent = score;
    wrongAnswersElement.textContent = wrongAnswers;

    // Add each question and result to the detailed table
    questions.forEach((question, index) => {
        const userAnswer = question.userAnswer || 'No answer';
        const correctAnswer = question.answer;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="clickable-question" data-index="${index}" style="cursor:pointer; text-decoration:underline;">
                ${question.question ? question.question : `<img src="${question.image}" alt="Question Image" style="max-width:100px;vertical-align:middle;">`}
            </td>
            <td style="color: ${userAnswer === correctAnswer ? 'green' : 'red'};">${userAnswer}</td>
            <td>${correctAnswer}</td>
        `;
        resultTableBody.appendChild(row);
    });

    // Add click event for each question cell
    document.querySelectorAll('.clickable-question').forEach(cell => {
        cell.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            showAnsweredQuestion(idx);
        });
    });

    // ✅ Fixed: Use backticks for string interpolation
    scoreElement.textContent = `You answered correctly ${score} / ${questions.length} questions.`;

    // Show the results interface
    document.getElementById('quiz-container').style.display = 'none'; // Hide the question section
    resultContainer.style.display = 'block'; // Show the results section
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
 
function showAnsweredQuestion(index) {
    lastQuestionIndex = currentQuestionIndex; // Save current position
    const question = questions[index];
    const questionContainer = document.getElementById('question-container');
    const userAnswer = question.userAnswer || 'No answer';
    const correctAnswer = question.answer;
    const isCorrect = userAnswer === correctAnswer;

    let questionContent = '';
    if (question.question) {
        questionContent = `<h2>Question ${index + 1}: ${question.question}</h2>`;
    } else {
        questionContent = `<h2>Question ${index + 1}:</h2><img src="${question.image}" alt="Question Image" style="max-width: 100%;">`;
    }

    questionContainer.innerHTML = `
        ${questionContent}
        <div id="options">
            ${question.options.map(option =>
                `<label style="color: ${
                    option === correctAnswer
                        ? 'green'
                        : (option === userAnswer ? 'red' : '#333')
                };">
                    <input type="radio" name="answer" value="${option}" disabled ${option === userAnswer ? 'checked' : ''}> ${option}
                </label><br>`
            ).join('')}
        </div>
        <div>
            <strong>Your answer:</strong> <span style="color:${isCorrect ? 'green' : 'red'}">${userAnswer}</span><br>
            <strong>Correct answer:</strong> <span style="color:green">${correctAnswer}</span>
        </div>
        <button onclick="backToLastQuestion()">Back to Quiz</button>
    `;
}
 
function backToLastQuestion() {
    currentQuestionIndex = lastQuestionIndex;
    displayQuestion();
    renderQuestionList();
}
 
function renderQuestionList() {
    const listDiv = document.getElementById('question-list');
    if (!listDiv) return;
    listDiv.innerHTML = '';
    questions.forEach((q, idx) => {
        let statusClass = '';
        if (q.userAnswer) {
            statusClass = (q.userAnswer === q.answer) ? 'answered-correct' : 'answered-wrong';
        }

        const btn = document.createElement('div');
        btn.className = 'question-list-item ' + statusClass + (idx === currentQuestionIndex ? ' current' : '');
        btn.innerHTML = `<span style="font-weight:bold;">${idx + 1}.</span> ` +
            (q.question ? q.question : '<i>Image question</i>');
        btn.title = q.question ? q.question : 'Image question';

        btn.onclick = function () {
            if (q.userAnswer) {
                showAnsweredQuestion(idx);
            } else {
                currentQuestionIndex = idx;
                displayQuestion();
                renderQuestionList();
            }
        };
        listDiv.appendChild(btn);
    });
}

displayQuestion();
renderQuestionList();
updateResult();