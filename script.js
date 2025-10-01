// Game state
let players = [];
let isGameStarted = false;

// DOM Elements
const wordForm = document.getElementById('word-form');
const playerNameInput = document.getElementById('player-name');
const playerWordInput = document.getElementById('player-word');
const playersList = document.getElementById('players');
const playerCount = document.getElementById('player-count');
const startGameBtn = document.getElementById('start-game-btn');

const submissionSection = document.getElementById('submission-section');
const gameSection = document.getElementById('game-section');
const revealSection = document.getElementById('reveal-section');

const readWordsBtn = document.getElementById('read-words-btn');
const repeatWordsBtn = document.getElementById('repeat-words-btn');
const revealBtn = document.getElementById('reveal-btn');
const newGameBtn = document.getElementById('new-game-btn');
const currentWordDisplay = document.getElementById('current-word');
const revealList = document.getElementById('reveal-list');

// Speech synthesis
const synth = window.speechSynthesis;
let currentUtterance = null;

// Word Submission
wordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = playerNameInput.value.trim();
    const word = playerWordInput.value.trim();
    
    if (name && word) {
        // Check if player already exists
        const existingPlayer = players.find(p => p.name.toLowerCase() === name.toLowerCase());
        
        if (existingPlayer) {
            alert('This player name already exists! Please use a different name.');
            return;
        }
        
        // Add player
        players.push({ name, word });
        
        // Update UI
        updatePlayerList();
        
        // Clear form
        playerNameInput.value = '';
        playerWordInput.value = '';
        
        // Focus back on name input
        playerNameInput.focus();
        
        // Enable start button if at least 2 players
        if (players.length >= 2) {
            startGameBtn.disabled = false;
        }
    }
});

// Update player list display
function updatePlayerList() {
    playerCount.textContent = players.length;
    playersList.innerHTML = '';
    
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${player.name}</span>
            <button class="btn-remove" onclick="removePlayer(${index})">✕</button>
        `;
        playersList.appendChild(li);
    });
}

// Remove player
function removePlayer(index) {
    players.splice(index, 1);
    updatePlayerList();
    
    if (players.length < 2) {
        startGameBtn.disabled = true;
    }
}

// Start game
startGameBtn.addEventListener('click', () => {
    if (players.length < 2) {
        alert('You need at least 2 players to start the game!');
        return;
    }
    
    isGameStarted = true;
    submissionSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    
    // Shuffle words to make it more interesting
    shuffleArray(players);
});

// Shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Read words aloud
readWordsBtn.addEventListener('click', () => {
    readAllWords();
});

repeatWordsBtn.addEventListener('click', () => {
    readAllWords();
});

function readAllWords() {
    // Stop any current speech
    synth.cancel();
    
    currentWordDisplay.textContent = 'Reading words...';
    
    // Create a sequence of utterances
    let utteranceIndex = 0;
    
    function speakNext() {
        if (utteranceIndex < players.length) {
            const player = players[utteranceIndex];
            
            // Update display
            currentWordDisplay.textContent = `Word ${utteranceIndex + 1} of ${players.length}`;
            
            // Create utterance
            const utterance = new SpeechSynthesisUtterance(player.word);
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // When this word finishes, speak the next one
            utterance.onend = () => {
                utteranceIndex++;
                // Add a small pause between words
                setTimeout(speakNext, 800);
            };
            
            utterance.onerror = (error) => {
                console.error('Speech error:', error);
                currentWordDisplay.textContent = 'Error reading words. Please try again.';
            };
            
            synth.speak(utterance);
        } else {
            currentWordDisplay.textContent = 'All words have been read!';
        }
    }
    
    speakNext();
}

// Reveal answers
revealBtn.addEventListener('click', () => {
    gameSection.classList.add('hidden');
    revealSection.classList.remove('hidden');
    
    // Stop any current speech
    synth.cancel();
    
    // Display all players and their words
    revealList.innerHTML = '';
    
    players.forEach((player, index) => {
        const revealItem = document.createElement('div');
        revealItem.className = 'reveal-item';
        revealItem.innerHTML = `
            <div class="reveal-number">${index + 1}</div>
            <div class="reveal-content">
                <div class="reveal-player">${player.name}</div>
                <div class="reveal-word">${player.word}</div>
            </div>
        `;
        revealList.appendChild(revealItem);
    });
});

// New game
newGameBtn.addEventListener('click', () => {
    // Reset game state
    players = [];
    isGameStarted = false;
    
    // Stop any speech
    synth.cancel();
    
    // Reset UI
    updatePlayerList();
    startGameBtn.disabled = true;
    currentWordDisplay.textContent = '';
    
    // Show submission section
    revealSection.classList.add('hidden');
    submissionSection.classList.remove('hidden');
    
    // Focus on name input
    playerNameInput.focus();
});

// Stop speech when page is closed
window.addEventListener('beforeunload', () => {
    synth.cancel();
});
