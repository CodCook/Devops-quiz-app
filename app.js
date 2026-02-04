/**
 * DevOps Quiz Application
 * Handles quiz logic, UI interactions, and score tracking
 */

class QuizApp {
    constructor() {
        // Quiz state
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.quizCompleted = false;

        // DOM Elements
        this.screens = {
            start: document.getElementById('start-screen'),
            quiz: document.getElementById('quiz-screen'),
            results: document.getElementById('results-screen'),
            loading: document.getElementById('loading-screen'),
            error: document.getElementById('error-screen')
        };

        this.elements = {
            startBtn: document.getElementById('start-btn'),
            nextBtn: document.getElementById('next-btn'),
            restartBtn: document.getElementById('restart-btn'),
            retryBtn: document.getElementById('retry-btn'),
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            progressBar: document.getElementById('progress-bar'),
            questionCounter: document.getElementById('question-counter'),
            scoreDisplay: document.getElementById('score-display'),
            finalScore: document.getElementById('final-score'),
            totalQuestions: document.getElementById('total-questions'),
            correctCount: document.getElementById('correct-count'),
            incorrectCount: document.getElementById('incorrect-count'),
            percentage: document.getElementById('percentage'),
            resultsMessage: document.getElementById('results-message'),
            errorMessage: document.getElementById('error-message')
        };

        // Bind event listeners
        this.bindEvents();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startQuiz());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.elements.restartBtn.addEventListener('click', () => this.restartQuiz());
        this.elements.retryBtn.addEventListener('click', () => this.loadQuestions());
    }

    /**
     * Show a specific screen and hide others
     * @param {string} screenName - Name of the screen to show
     */
    showScreen(screenName) {
        Object.keys(this.screens).forEach(key => {
            if (key === screenName) {
                this.screens[key].classList.remove('hidden');
            } else {
                this.screens[key].classList.add('hidden');
            }
        });
    }

    /**
     * Load questions from JSON file
     */
    async loadQuestions() {
        this.showScreen('loading');

        try {
            const response = await fetch('data/questions.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
                throw new Error('Invalid or empty questions data');
            }

            this.questions = this.shuffleArray([...data.questions]);
            this.showScreen('start');
        } catch (error) {
            console.error('Error loading questions:', error);
            this.elements.errorMessage.textContent = `Failed to load questions: ${error.message}`;
            this.showScreen('error');
        }
    }

    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Start the quiz
     */
    startQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizCompleted = false;
        this.showScreen('quiz');
        this.displayQuestion();
    }

    /**
     * Display the current question
     */
    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        this.selectedAnswer = null;
        this.elements.nextBtn.disabled = true;

        // Update question text
        this.elements.questionText.textContent = question.question;

        // Update progress
        this.updateProgress();

        // Create option buttons
        this.elements.optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        
        // Shuffle options for randomization
        const shuffledOptions = this.shuffleArray([...question.options]);
        
        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerHTML = `
                <span class="option-letter">${letters[index]}</span>
                <span class="option-text">${option}</span>
            `;
            button.addEventListener('click', () => this.selectAnswer(button, option, question.answer));
            this.elements.optionsContainer.appendChild(button);
        });
    }

    /**
     * Handle answer selection
     * @param {HTMLElement} button - The clicked button
     * @param {string} selectedOption - The selected option text
     * @param {string} correctAnswer - The correct answer text
     */
    selectAnswer(button, selectedOption, correctAnswer) {
        if (this.selectedAnswer !== null) return; // Already answered

        this.selectedAnswer = selectedOption;
        const isCorrect = selectedOption === correctAnswer;

        // Disable all option buttons
        const allButtons = this.elements.optionsContainer.querySelectorAll('.option-btn');
        allButtons.forEach(btn => btn.disabled = true);

        // Mark selected answer
        if (isCorrect) {
            button.classList.add('correct');
            this.score++;
        } else {
            button.classList.add('incorrect');
            // Highlight the correct answer
            allButtons.forEach(btn => {
                if (btn.querySelector('.option-text').textContent === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }

        // Update score display
        this.elements.scoreDisplay.textContent = `Score: ${this.score}`;

        // Enable next button
        this.elements.nextBtn.disabled = false;

        // Auto-advance on last question or update button text
        if (this.currentQuestionIndex === this.questions.length - 1) {
            this.elements.nextBtn.textContent = 'See Results';
        }
    }

    /**
     * Move to the next question or show results
     */
    nextQuestion() {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.questions.length) {
            this.elements.nextBtn.textContent = 'Next Question';
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    /**
     * Update progress bar and counter
     */
    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        this.elements.progressBar.style.width = `${progress}%`;
        this.elements.questionCounter.textContent = `Question ${this.currentQuestionIndex + 1}/${this.questions.length}`;
    }

    /**
     * Display quiz results
     */
    showResults() {
        this.quizCompleted = true;
        const totalQuestions = this.questions.length;
        const incorrect = totalQuestions - this.score;
        const percentage = Math.round((this.score / totalQuestions) * 100);

        // Update results display
        this.elements.finalScore.textContent = this.score;
        this.elements.totalQuestions.textContent = totalQuestions;
        this.elements.correctCount.textContent = this.score;
        this.elements.incorrectCount.textContent = incorrect;
        this.elements.percentage.textContent = `${percentage}%`;

        // Set results message based on score
        let message;
        if (percentage >= 90) {
            message = '🏆 Outstanding! You\'re a DevOps expert!';
        } else if (percentage >= 70) {
            message = '🎉 Great job! You have solid DevOps knowledge!';
        } else if (percentage >= 50) {
            message = '👍 Good effort! Keep learning about DevOps!';
        } else {
            message = '📚 Keep studying! DevOps takes practice!';
        }
        this.elements.resultsMessage.textContent = message;

        this.showScreen('results');
    }

    /**
     * Restart the quiz
     */
    restartQuiz() {
        // Reshuffle questions for a new experience
        this.questions = this.shuffleArray([...this.questions]);
        this.elements.nextBtn.textContent = 'Next Question';
        this.elements.scoreDisplay.textContent = 'Score: 0';
        this.startQuiz();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadQuestions();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new QuizApp();
    app.init();
});
