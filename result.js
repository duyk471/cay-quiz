document.addEventListener('DOMContentLoaded', () => {
    const finalScore = document.getElementById('final-score');
    const incorrectAnswersList = document.getElementById('incorrect-answers-list');
    const noMistakesMessage = document.getElementById('no-mistakes-message');

    const resultData = JSON.parse(localStorage.getItem('quizResult'));

    if (resultData) {
        finalScore.textContent = `${resultData.score}/${resultData.totalQuestions}`;
        
        if (resultData.wrongAnswers.length > 0) {
            resultData.wrongAnswers.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('mb-4', 'p-4', 'bg-red-50', 'rounded-lg', 'border', 'border-red-200');
                li.innerHTML = `
                    <p class="font-bold">Câu hỏi: ${item.question}</p>
                    <p class="text-sm">Câu trả lời của bạn: <span class="text-red-600 font-semibold">${item.yourAnswer}</span></p>
                    <p class="text-sm">Đáp án đúng: <span class="text-green-600 font-semibold">${item.correctAnswer}</span></p>
                `;
                incorrectAnswersList.appendChild(li);
            });
        } else {
            noMistakesMessage.classList.remove('hidden');
        }
        
        // Xóa dữ liệu quiz khỏi localStorage để không hiển thị lại khi tải lại trang
        localStorage.removeItem('quizResult');
    } else {
        // Nếu không có dữ liệu, quay về trang chủ
        window.location.href = 'index.html';
    }
});