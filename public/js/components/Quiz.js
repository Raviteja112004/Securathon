class Quiz {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userId = null;
        this.difficulty = 'medium';
        this.pointsEarned = 0;
    }

    async init(userId) {
        this.userId = userId;
        await this.loadQuestions();
        this.renderQuiz();
    }

    async loadQuestions() {
        try {
            const response = await fetch(`/api/quiz/questions?difficulty=${this.difficulty}`);
            this.questions = await response.json();
            this.shuffleQuestions();
        } catch (error) {
            console.error('Failed to load questions:', error);
        }
    }

    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    async submitAnswer(selectedOption) {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        
        // Calculate points based on difficulty and correctness
        const basePoints = {
            'easy': 10,
            'medium': 20,
            'hard': 30
        };
        
        const points = isCorrect ? basePoints[this.difficulty] : 0;
        this.pointsEarned += points;
        
        // Update points in the database
        if (points > 0) {
            await this.updatePoints(points, {
                type: 'quiz',
                description: `Correct answer in ${this.difficulty} difficulty quiz`
            });
        }

        // Show feedback
        this.showFeedback(isCorrect, currentQuestion.explanation);

        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex < this.questions.length) {
                this.renderQuiz();
            } else {
                this.showResults();
            }
        }, 2000);
    }

    async updatePoints(points, activity) {
        try {
            const response = await fetch('/api/team/update-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    points,
                    activity
                })
            });

            const result = await response.json();
            // Update points display if needed
            if (window.teamHub) {
                window.teamHub.points = result.totalPoints;
                window.teamHub.renderTeamHub();
            }
        } catch (error) {
            console.error('Failed to update points:', error);
        }
    }

    showFeedback(isCorrect, explanation) {
        const feedbackElement = document.getElementById('quiz-feedback');
        if (feedbackElement) {
            feedbackElement.innerHTML = `
                <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="feedback-icon">${isCorrect ? '✓' : '✗'}</div>
                    <div class="feedback-content">
                        <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                        <p>${explanation}</p>
                        ${isCorrect ? `<p class="points-earned">+${this.getPointsForCurrentQuestion()} points</p>` : ''}
                    </div>
                </div>
            `;
            feedbackElement.style.display = 'block';
        }
    }

    getPointsForCurrentQuestion() {
        const basePoints = {
            'easy': 10,
            'medium': 20,
            'hard': 30
        };
        return basePoints[this.difficulty];
    }

    showResults() {
        const quizContainer = document.getElementById('quiz-container');
        if (quizContainer) {
            const percentage = (this.score / this.questions.length) * 100;
            quizContainer.innerHTML = `
                <div class="quiz-results">
                    <h2>Quiz Complete!</h2>
                    <div class="results-summary">
                        <div class="result-item">
                            <span class="result-label">Score</span>
                            <span class="result-value">${this.score}/${this.questions.length}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Percentage</span>
                            <span class="result-value">${percentage}%</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Points Earned</span>
                            <span class="result-value">${this.pointsEarned}</span>
                        </div>
                    </div>
                    <div class="results-actions">
                        <button onclick="quiz.restartQuiz()" class="restart-btn">Try Again</button>
                        <a href="/teamhub" class="teamhub-btn">Back to Team Hub</a>
                    </div>
                </div>
            `;
        }
    }

    async restartQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.pointsEarned = 0;
        await this.loadQuestions();
        this.renderQuiz();
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.restartQuiz();
    }

    renderQuiz() {
        const quizContainer = document.getElementById('quiz-container');
        if (!quizContainer) return;

        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion) return;

        quizContainer.innerHTML = `
            <div class="quiz-header">
                <div class="difficulty-selector">
                    <button onclick="quiz.setDifficulty('easy')" class="${this.difficulty === 'easy' ? 'active' : ''}">Easy</button>
                    <button onclick="quiz.setDifficulty('medium')" class="${this.difficulty === 'medium' ? 'active' : ''}">Medium</button>
                    <button onclick="quiz.setDifficulty('hard')" class="${this.difficulty === 'hard' ? 'active' : ''}">Hard</button>
                </div>
                <div class="quiz-progress">
                    Question ${this.currentQuestionIndex + 1} of ${this.questions.length}
                </div>
            </div>
            <div class="question-card">
                <h2>${currentQuestion.question}</h2>
                <div class="options-grid">
                    ${currentQuestion.options.map((option, index) => `
                        <button onclick="quiz.submitAnswer('${option}')" class="option-btn">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div id="quiz-feedback" style="display: none;"></div>
        `;
    }
}

// Initialize Quiz globally
window.quiz = new Quiz(); 