const socket = io();

// DOM Elements
const joinSection = document.getElementById('join-section');
const submitSection = document.getElementById('submit-section');
const waitingSection = document.getElementById('waiting-section');
const playingSection = document.getElementById('playing-section');
const revealSection = document.getElementById('reveal-section');

const joinForm = document.getElementById('join-form');
const roomCodeInput = document.getElementById('room-code-input');
const playerNameInput = document.getElementById('player-name-input');
const errorMessage = document.getElementById('error-message');

const joinedRoomCode = document.getElementById('joined-room-code');
const joinedPlayerName = document.getElementById('joined-player-name');

const wordForm = document.getElementById('word-form');
const wordInput = document.getElementById('word-input');

const submittedWord = document.getElementById('submitted-word');
const playerRevealList = document.getElementById('player-reveal-list');

let currentRoomCode = null;
let currentPlayerName = null;

// Auto-uppercase room code
roomCodeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

// Join Game
joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const roomCode = roomCodeInput.value.trim().toUpperCase();
    const playerName = playerNameInput.value.trim();
    
    if (roomCode && playerName) {
        socket.emit('join-game', { roomCode, playerName });
    }
});

// Socket Events
socket.on('join-success', ({ roomCode, playerName }) => {
    currentRoomCode = roomCode;
    currentPlayerName = playerName;
    
    joinedRoomCode.textContent = roomCode;
    joinedPlayerName.textContent = playerName;
    
    joinSection.classList.add('hidden');
    submitSection.classList.remove('hidden');
    
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
});

socket.on('join-error', ({ message }) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
});

// Submit Word
wordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const word = wordInput.value.trim();
    
    if (word) {
        socket.emit('submit-word', {
            roomCode: currentRoomCode,
            playerName: currentPlayerName,
            word: word
        });
    }
});

socket.on('word-submitted', () => {
    submittedWord.textContent = wordInput.value.trim();
    submitSection.classList.add('hidden');
    waitingSection.classList.remove('hidden');
});

socket.on('submit-error', ({ message }) => {
    alert(message);
});

// Game Phase Changes
socket.on('game-phase-change', ({ phase }) => {
    if (phase === 'playing') {
        waitingSection.classList.add('hidden');
        playingSection.classList.remove('hidden');
    }
});

// Reveal Answers
socket.on('answers-revealed', ({ results }) => {
    playingSection.classList.add('hidden');
    revealSection.classList.remove('hidden');
    
    playerRevealList.innerHTML = '';
    
    results.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'reveal-item';
        
        // Highlight the current player's word
        const isCurrentPlayer = result.name === currentPlayerName;
        if (isCurrentPlayer) {
            item.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            item.style.color = 'white';
        }
        
        item.innerHTML = `
            <div class="reveal-number" ${isCurrentPlayer ? 'style="background: white; color: #667eea;"' : ''}>${index + 1}</div>
            <div class="reveal-content">
                <div class="reveal-player" ${isCurrentPlayer ? 'style="color: white;"' : ''}>${result.name}${isCurrentPlayer ? ' (You)' : ''}</div>
                <div class="reveal-word" ${isCurrentPlayer ? 'style="color: white;"' : ''}>${result.word}</div>
            </div>
        `;
        playerRevealList.appendChild(item);
    });
});

// Reset Game
socket.on('game-reset', () => {
    // Go back to submit section
    revealSection.classList.add('hidden');
    playingSection.classList.add('hidden');
    waitingSection.classList.add('hidden');
    submitSection.classList.remove('hidden');
    
    wordInput.value = '';
});

// Host Disconnected
socket.on('host-disconnected', () => {
    alert('The host has disconnected. The game has ended.');
    location.reload();
});

// Disconnect handling
socket.on('disconnect', () => {
    alert('Disconnected from server');
});
