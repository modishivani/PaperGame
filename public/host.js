const socket = io();

// DOM Elements
const wifiSettingsSection = document.getElementById('wifi-settings-section');
const waitingSection = document.getElementById('waiting-section');
const gameSection = document.getElementById('game-section');
const revealSection = document.getElementById('reveal-section');

const wifiForm = document.getElementById('wifi-form');
const wifiNetworkInput = document.getElementById('wifi-network');
const wifiPasswordInput = document.getElementById('wifi-password');
const displayWifiNetwork = document.getElementById('display-wifi-network');
const displayWifiPassword = document.getElementById('display-wifi-password');
const roomCodeDisplay = document.getElementById('room-code');
const playersGrid = document.getElementById('players-grid');
const playerCount = document.getElementById('player-count');
const startGameBtn = document.getElementById('start-game-btn');
const readWordsBtn = document.getElementById('read-words-btn');
const repeatWordsBtn = document.getElementById('repeat-words-btn');
const revealBtn = document.getElementById('reveal-btn');
const newGameBtn = document.getElementById('new-game-btn');
const currentWordDisplay = document.getElementById('current-word');
const revealList = document.getElementById('reveal-list');

let currentRoomCode = null;
let gameWords = [];

// Speech synthesis
const synth = window.speechSynthesis;

// WiFi Form Submission
wifiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const wifiNetwork = wifiNetworkInput.value.trim();
    const wifiPassword = wifiPasswordInput.value.trim();
    
    if (wifiNetwork && wifiPassword) {
        // Update display elements
        displayWifiNetwork.textContent = wifiNetwork;
        displayWifiPassword.textContent = wifiPassword;
        
        // Create the game
        socket.emit('create-game');
    }
});

// Socket Events
socket.on('game-created', ({ roomCode }) => {
    currentRoomCode = roomCode;
    roomCodeDisplay.textContent = roomCode;
    
    // Hide WiFi settings and show waiting section
    wifiSettingsSection.classList.add('hidden');
    waitingSection.classList.remove('hidden');
});

socket.on('player-joined', ({ players }) => {
    updatePlayerList(players);
});

socket.on('player-submitted', ({ players }) => {
    updatePlayerList(players);
});

socket.on('player-left', ({ playerName, players }) => {
    updatePlayerList(players);
    // Removed popup alert notification
});

function updatePlayerList(players) {
    playerCount.textContent = players.length;
    playersGrid.innerHTML = '';
    
    players.forEach(player => {
        const card = document.createElement('div');
        card.className = `player-card ${player.submitted ? 'submitted' : ''}`;
        card.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-status">${player.submitted ? '✓ Submitted' : 'Waiting...'}</div>
        `;
        playersGrid.appendChild(card);
    });
    
    // Enable start button if at least 2 players have submitted
    const submittedCount = players.filter(p => p.submitted).length;
    startGameBtn.disabled = submittedCount < 2;
}

// Start Game
startGameBtn.addEventListener('click', () => {
    socket.emit('start-game', { roomCode: currentRoomCode });
});

socket.on('game-started', ({ words }) => {
    gameWords = words;
    waitingSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
});

// Read Words
readWordsBtn.addEventListener('click', () => {
    readAllWords();
});

repeatWordsBtn.addEventListener('click', () => {
    readAllWords();
});

function readAllWords() {
    synth.cancel();
    
    if (gameWords.length === 0) {
        currentWordDisplay.textContent = 'No words to read!';
        return;
    }
    
    currentWordDisplay.textContent = 'Reading words...';
    
    let index = 0;

    function speakNext() {
        if (index < gameWords.length) {
            // Get available voices before speaking each word
            const voices = synth.getVoices();
            
            currentWordDisplay.textContent = `Word ${index + 1} of ${gameWords.length}`;
            
            const utterance = new SpeechSynthesisUtterance(gameWords[index]);
            
            utterance.voice = voices[1]; // 23 is other good option, 108 for en-in
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onend = () => {
                index++;
                // Increased timeout between words (1.5 seconds)
                setTimeout(speakNext, 1500);
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

// Reveal Answers
revealBtn.addEventListener('click', () => {
    socket.emit('reveal-answers', { roomCode: currentRoomCode });
});

socket.on('answers-revealed', ({ results }) => {
    synth.cancel();
    gameSection.classList.add('hidden');
    revealSection.classList.remove('hidden');
    
    revealList.innerHTML = '';
    
    results.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'reveal-item';
        item.innerHTML = `
            <div class="reveal-number">${index + 1}</div>
            <div class="reveal-content">
                <div class="reveal-player">${result.name}</div>
                <div class="reveal-word">${result.word}</div>
            </div>
        `;
        revealList.appendChild(item);
    });
});

// New Game
newGameBtn.addEventListener('click', () => {
    socket.emit('reset-game', { roomCode: currentRoomCode });
});

socket.on('game-reset', () => {
    gameWords = [];
    synth.cancel();
    currentWordDisplay.textContent = 'Click "Read All Words" to begin';
    revealSection.classList.add('hidden');
    waitingSection.classList.remove('hidden');
    startGameBtn.disabled = true;
});

// Disconnect handling
socket.on('disconnect', () => {
    // Removed popup alert notification
});

// Cleanup
window.addEventListener('beforeunload', () => {
    synth.cancel();
});
