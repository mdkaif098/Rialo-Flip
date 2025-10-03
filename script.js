document.addEventListener('DOMContentLoaded', () => {
    // MODIFIED: Added selectors for high score elements
    const gameContainer = document.getElementById('game-container');
    const difficultySelector = document.getElementById('difficulty-selector');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const gameBoard = document.getElementById('game-board');
    const winMessage = document.getElementById('win-message');
    const movesCount = document.getElementById('moves-count');
    const timerDisplay = document.getElementById('timer');
    const restartButton = document.getElementById('restart-button');
    const easyBestTimeSpan = document.getElementById('easy-best-time');
    const mediumBestTimeSpan = document.getElementById('medium-best-time');
    
    const cardImages = [
        { name: 'rialo1', img: 'images/rialo1.png' },
        { name: 'rialo2', img: 'images/rialo2.png' },
        { name: 'rialo3', img: 'images/rialo3.png' },
        { name: 'rialo4', img: 'images/rialo4.png' },
        { name: 'rialo5', img: 'images/rialo5.png' },
        { name: 'rialo6', img: 'images/rialo6.png' }
    ];

    let flippedCards = [], lockBoard = false, matchedPairs = 0, moves = 0;
    let timerInterval, seconds = 0, gameStarted = false;
    let totalPairs = 0, currentDifficulty = '';

    // NEW: Function to format time from seconds to MM:SS
    function formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds === null) return '--:--';
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    // NEW: Function to load and display high scores from localStorage
    function loadHighScores() {
        const easyBest = localStorage.getItem('easyBestTime');
        const mediumBest = localStorage.getItem('mediumBestTime');
        easyBestTimeSpan.textContent = formatTime(parseInt(easyBest));
        mediumBestTimeSpan.textContent = formatTime(parseInt(mediumBest));
    }

    // NEW: Function to check and update high score on win
    function updateHighScore() {
        const key = `${currentDifficulty}BestTime`;
        const existingBestTime = localStorage.getItem(key);
        if (!existingBestTime || seconds < parseInt(existingBestTime)) {
            localStorage.setItem(key, seconds);
            loadHighScores(); // Refresh display
        }
    }

    function startGame(difficulty) {
        currentDifficulty = difficulty;
        moves = 0, matchedPairs = 0, seconds = 0, gameStarted = false;
        movesCount.textContent = '0';
        timerDisplay.textContent = '00:00';
        winMessage.classList.add('hidden');
        clearInterval(timerInterval);
        
        if (difficulty === 'easy') {
            totalPairs = 3;
            gameBoard.style.gridTemplateColumns = 'repeat(3, 100px)';
            gameBoard.style.gridTemplateRows = 'repeat(2, 100px)';
        } else {
            totalPairs = 6;
            gameBoard.style.gridTemplateColumns = 'repeat(4, 100px)';
            gameBoard.style.gridTemplateRows = 'repeat(3, 100px)';
        }

        const cardsForGame = cardImages.slice(0, totalPairs);
        let gameGrid = [...cardsForGame, ...cardsForGame];
        
        difficultySelector.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        createBoard(gameGrid);
    }
    
    function shuffle(array) {
        array.sort(() => 0.5 - Math.random());
    }

    function createBoard(grid) {
        gameBoard.innerHTML = '';
        shuffle(grid);
        grid.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.name = item.name;
            const cardInner = document.createElement('div');
            cardInner.classList.add('card-inner');
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            const img = document.createElement('img');
            img.src = item.img;
            cardFront.appendChild(img);
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            gameBoard.appendChild(card);
            card.addEventListener('click', flipCard);
        });
    }

    function startTimer() {
        gameStarted = true;
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.textContent = formatTime(seconds); // MODIFIED: Use formatTime
        }, 1000);
    }

    function flipCard() {
        if (!gameStarted) startTimer();
        if (lockBoard || this.classList.contains('flipped') || this === flippedCards[0]) return;
        this.classList.add('flipped');
        flippedCards.push(this);
        if (flippedCards.length === 2) {
            moves++;
            movesCount.textContent = moves;
            checkForMatch();
        }
    }

    function checkForMatch() {
        lockBoard = true;
        const [firstCard, secondCard] = flippedCards;
        const isMatch = firstCard.dataset.name === secondCard.dataset.name;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        flippedCards.forEach(card => {
            card.removeEventListener('click', flipCard);
            card.classList.add('matched');
            card.addEventListener('animationend', () => card.classList.remove('matched'), { once: true });
        });
        matchedPairs++;
        resetBoard();
        if (matchedPairs === totalPairs) {
            clearInterval(timerInterval);
            updateHighScore(); // MODIFIED: Update score on win
            setTimeout(() => winMessage.classList.remove('hidden'), 500);
        }
    }

    function unflipCards() {
        setTimeout(() => {
            flippedCards.forEach(card => card.classList.remove('flipped'));
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        flippedCards = [];
        lockBoard = false;
    }

    // Event Listeners
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => startGame(button.dataset.difficulty));
    });
    restartButton.addEventListener('click', () => {
        if (currentDifficulty) startGame(currentDifficulty);
    });

    // Initial Load
    loadHighScores();
});