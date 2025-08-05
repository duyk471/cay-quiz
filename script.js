const homeScreen = document.getElementById('home-screen');
const setupScreen = document.getElementById('setup-screen');
const quizScreen = document.getElementById('quiz-screen');

const tsvFile = document.getElementById('tsv-file');
const flashcardList = document.getElementById('flashcard-list');
const quizCountInput = document.getElementById('quiz-count-input');
const startButton = document.getElementById('start-button');
const backToHomeButton = document.getElementById('back-to-home');
const maxQuestionsInfo = document.getElementById('max-questions-info');
const currentDeckName = document.getElementById('current-deck-name');

const questionTerm = document.getElementById('question-term');
const answersContainer = document.getElementById('answers-container');
const quizProgress = document.getElementById('quiz-progress');
const scoreDisplay = document.getElementById('score-display');

let allFlashcardDecks = {};
let currentDeckData = [];
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;

// Xử lý khi người dùng chọn tệp
tsvFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const tsvContent = e.target.result;
            const fileName = file.name.replace('.tsv', '');
            
            // Lưu bộ thẻ mới vào đối tượng và localStorage
            allFlashcardDecks[fileName] = parseTsvData(tsvContent);
            localStorage.setItem('allFlashcardDecks', JSON.stringify(allFlashcardDecks));
            
            displayFlashcardDecks();
            event.target.value = ''; // Reset input file
        };
        reader.readAsText(file);
    }
});

// Xử lý khi bấm nút "Bắt đầu"
startButton.addEventListener('click', () => {
    totalQuestions = parseInt(quizCountInput.value);
    if (isNaN(totalQuestions) || totalQuestions <= 0 || totalQuestions > currentDeckData.length) {
        alert('Số câu hỏi không hợp lệ!');
        return;
    }
    
    quizQuestions = shuffleArray(currentDeckData).slice(0, totalQuestions);
    
    currentQuestionIndex = 0;
    score = 0;
    
    setupScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    displayQuestion();
});

// Xử lý nút "Quay lại"
backToHomeButton.addEventListener('click', () => {
    setupScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
});

// Hàm hiển thị danh sách bộ thẻ
function displayFlashcardDecks() {
    flashcardList.innerHTML = ''; // Xóa danh sách cũ
    const deckNames = Object.keys(allFlashcardDecks);
    
    if (deckNames.length === 0) {
        flashcardList.innerHTML = '<p class="text-gray-500 text-center">Chưa có bộ thẻ nào được thêm.</p>';
    } else {
        deckNames.forEach(name => {
            const deckCard = document.createElement('button');
            deckCard.textContent = `${name} (${allFlashcardDecks[name].length} thẻ)`;
            deckCard.classList.add(
                'deck-card', 'bg-gray-200', 'hover:bg-gray-300', 'text-gray-800', 'font-semibold', 
                'py-4', 'px-6', 'rounded-lg', 'text-left', 'w-full', 'shadow-md', 'transition-colors', 'mb-2'
            );
            deckCard.addEventListener('click', () => selectDeck(name));
            flashcardList.appendChild(deckCard);
        });
    }
}

// Xử lý khi chọn một bộ thẻ
function selectDeck(deckName) {
    currentDeckData = allFlashcardDecks[deckName];
    currentDeckName.textContent = deckName;
    
    homeScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    
    maxQuestionsInfo.textContent = `Tổng số câu hỏi có sẵn: ${currentDeckData.length}`;
    quizCountInput.max = currentDeckData.length;
    quizCountInput.value = currentDeckData.length;
}

// Phân tích dữ liệu từ tệp TSV
function parseTsvData(tsv) {
    const lines = tsv.trim().split('\n');
    return lines.map(line => {
        const [term, definition] = line.split('\t');
        return { term, definition };
    });
}

// Hiển thị câu hỏi
function displayQuestion() {
    if (currentQuestionIndex >= totalQuestions) {
        alert(`Bạn đã hoàn thành quiz! Điểm của bạn là: ${score}/${totalQuestions}`);
        homeScreen.classList.remove('hidden');
        quizScreen.classList.add('hidden');
        return;
    }
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    questionTerm.textContent = currentQuestion.term;
    
    const incorrectAnswers = currentDeckData
        .filter(item => item.definition !== currentQuestion.definition)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(item => item.definition);
        
    const allAnswers = shuffleArray([...incorrectAnswers, currentQuestion.definition]);
    
    answersContainer.innerHTML = '';
    
    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.classList.add(
            'answer-button', 'bg-gray-200', 'hover:bg-gray-300', 'text-gray-800', 'font-semibold', 
            'py-4', 'px-6', 'rounded-lg', 'text-left', 'w-full', 'shadow-md', 'transition-colors'
        );
        button.addEventListener('click', () => handleAnswer(button, answer, currentQuestion.definition));
        answersContainer.appendChild(button);
    });
    
    updateProgress();
}

// Xử lý khi người dùng chọn đáp án
function handleAnswer(button, selectedAnswer, correctAnswer) {
    const answerButtons = answersContainer.querySelectorAll('.answer-button');
    answerButtons.forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === correctAnswer) {
        button.classList.add('answer-correct');
        score++;
    } else {
        button.classList.add('answer-incorrect');
        const correctButton = Array.from(answerButtons).find(btn => btn.textContent === correctAnswer);
        if (correctButton) {
            correctButton.classList.add('answer-correct');
        }
    }
    
    updateProgress();
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 1000);
}

// Cập nhật thông tin tiến độ và điểm số
function updateProgress() {
    quizProgress.textContent = `Câu ${currentQuestionIndex + 1}/${totalQuestions}`;
    scoreDisplay.textContent = `Đúng: ${score}/${totalQuestions}`;
}

// Hàm xáo trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[i], array[j]];
    }
    return array;
}

// Tải dữ liệu từ localStorage khi trang được load
window.addEventListener('load', () => {
    const storedDecks = localStorage.getItem('allFlashcardDecks');
    if (storedDecks) {
        allFlashcardDecks = JSON.parse(storedDecks);
    }
    displayFlashcardDecks();
});