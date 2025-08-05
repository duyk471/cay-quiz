const homeScreen = document.getElementById('home-screen');
const setupScreen = document.getElementById('setup-screen');
const quizScreen = document.getElementById('quiz-screen');

const csvFile = document.getElementById('csv-file');
const flashcardList = document.getElementById('flashcard-list');
const quizCountInput = document.getElementById('quiz-count-input');
const startButton = document.getElementById('start-button');
const backToHomeButton = document.getElementById('back-to-home');
const maxQuestionsInfo = document.getElementById('max-questions-info');
const currentDeckName = document.getElementById('current-deck-name');
const exitQuizButton = document.getElementById('exit-quiz');

const questionTerm = document.getElementById('question-term');
const answersContainer = document.getElementById('answers-container');
const quizProgress = document.getElementById('quiz-progress');
const scoreDisplay = document.getElementById('score-display');
const feedbackMessage = document.getElementById('feedback-message');

let allFlashcardDecks = {};
let currentDeckData = [];
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;

// Xử lý khi người dùng chọn tệp
csvFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target.result;
            const fileName = file.name.replace('.csv', '');
            
            // Lưu bộ thẻ mới vào đối tượng và localStorage
            allFlashcardDecks[fileName] = parseCsvData(csvContent);
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
    
    quizQuestions = shuffleArray([...currentDeckData]).slice(0, totalQuestions);
    
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

// Xử lý nút "Thoát Quiz"
exitQuizButton.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn thoát quiz? Mọi tiến trình sẽ bị mất.')) {
        quizScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
    }
});

// Hàm hiển thị danh sách bộ thẻ
function displayFlashcardDecks() {
    flashcardList.innerHTML = ''; // Xóa danh sách cũ
    const deckNames = Object.keys(allFlashcardDecks);
    
    if (deckNames.length === 0) {
        flashcardList.innerHTML = '<p class="text-gray-500 text-center">Chưa có bộ thẻ nào được thêm.</p>';
    } else {
        deckNames.forEach(name => {
            const deckDiv = document.createElement('div');
            deckDiv.classList.add('flex', 'items-center', 'justify-between', 'bg-gray-200', 'p-4', 'rounded-lg', 'shadow-md', 'mb-2', 'transition-colors');

            const deckButton = document.createElement('button');
            deckButton.textContent = `${name} (${allFlashcardDecks[name].length} thẻ)`;
            deckButton.classList.add('text-gray-800', 'font-semibold', 'text-left', 'flex-grow');
            deckButton.addEventListener('click', () => selectDeck(name));

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>';
            deleteButton.classList.add('ml-4');
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Ngăn chặn sự kiện click vào nút cha
                deleteDeck(name);
            });
            
            deckDiv.appendChild(deckButton);
            deckDiv.appendChild(deleteButton);
            flashcardList.appendChild(deckDiv);
        });
    }
}

// Hàm xóa bộ thẻ
function deleteDeck(deckName) {
    if (confirm(`Bạn có chắc chắn muốn xóa bộ thẻ "${deckName}" không?`)) {
        delete allFlashcardDecks[deckName];
        localStorage.setItem('allFlashcardDecks', JSON.stringify(allFlashcardDecks));
        displayFlashcardDecks();
    }
}

// Phân tích dữ liệu từ tệp CSV
function parseCsvData(csv) {
    const lines = csv.trim().split('\n');
    return lines.map(line => {
        const parts = line.split(',');
        const term = parts[0].trim();
        const definition = parts.slice(1).join(',').trim(); // Lấy tất cả các cột còn lại làm definition
        return { term, definition };
    });
}

// Hiển thị câu hỏi
function displayQuestion() {
    if (currentQuestionIndex >= totalQuestions) {
        alert(`Bạn đã hoàn thành quiz! Điểm của bạn là: ${score}/${totalQuestions}`);
        quizScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
        return;
    }
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    questionTerm.textContent = currentQuestion.term;
    
    // Lấy 3 đáp án sai ngẫu nhiên từ toàn bộ bộ thẻ, không phải chỉ từ các câu hỏi đã chọn
    const incorrectAnswers = shuffleArray([...currentDeckData])
        .filter(item => item.definition !== currentQuestion.definition)
        .map(item => item.definition)
        .slice(0, 3);
        
    const allAnswers = shuffleArray([...incorrectAnswers, currentQuestion.definition]);
    
    answersContainer.innerHTML = '';
    feedbackMessage.textContent = ''; // Xóa thông báo cũ
    
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
        feedbackMessage.textContent = 'Chính xác! 🎉';
        feedbackMessage.classList.remove('text-red-500');
        feedbackMessage.classList.add('text-green-500');
        score++;
    } else {
        feedbackMessage.textContent = `Sai rồi, đáp án đúng là: "${correctAnswer}"`;
        feedbackMessage.classList.remove('text-green-500');
        feedbackMessage.classList.add('text-red-500');
    }
    
    updateProgress();
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000); // Tăng thời gian hiển thị thông báo
}

// Cập nhật thông tin tiến độ và điểm số
function updateProgress() {
    quizProgress.textContent = `Câu ${currentQuestionIndex + 1}/${totalQuestions}`;
    scoreDisplay.textContent = `Đúng: ${score}/${currentQuestionIndex}`;
}

// Hàm xáo trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
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

// Chức năng chọn bộ thẻ
function selectDeck(deckName) {
    currentDeckData = allFlashcardDecks[deckName];
    currentDeckName.textContent = deckName;
    
    homeScreen.classList.add('hidden');
    setupScreen.classList.remove('flex'); // Dùng flex để hiển thị
    setupScreen.classList.add('flex');
    
    maxQuestionsInfo.textContent = `Tổng số câu hỏi có sẵn: ${currentDeckData.length}`;
    quizCountInput.max = currentDeckData.length;
    quizCountInput.value = currentDeckData.length;
}