const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static('public'));

// Game state management
const games = new Map(); // roomCode -> game data

// Generate a random 6-letter uppercase code (A-Z only)
function generateRoomCode() {
    let code = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 6; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
}

// Get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// Inject LAN IP as a JS variable for index.html
app.get('/', (req, res) => {
    const fs = require('fs');
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server error');
        const localIP = getLocalIP();
        // Inject a <script> with JOIN_IP variable after <head>
        const injected = data.replace('<head>', `<head>\n    <script>var JOIN_IP=\'${localIP}\';</script>`);
        res.send(injected);
    });
});

app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Host creates a new game
    socket.on('create-game', () => {
        const roomCode = generateRoomCode();
        const gameData = {
            roomCode,
            hostId: socket.id,
            players: [],
            gameStarted: false,
            gamePhase: 'submission' // submission, playing, reveal
        };
        
        games.set(roomCode, gameData);
        socket.join(roomCode);
        
        socket.emit('game-created', { roomCode });
        console.log(`Game created: ${roomCode}`);
    });

    // Player joins a game
    socket.on('join-game', ({ roomCode, playerName }) => {
        const game = games.get(roomCode);
        
        if (!game) {
            socket.emit('join-error', { message: 'Game not found!' });
            return;
        }
        
        if (game.gameStarted) {
            socket.emit('join-error', { message: 'Game already started!' });
            return;
        }
        
        // Check if player name already exists
        const nameExists = game.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (nameExists) {
            socket.emit('join-error', { message: 'Name already taken!' });
            return;
        }
        
        const player = {
            id: socket.id,
            name: playerName,
            word: null,
            submitted: false
        };
        
        game.players.push(player);
        socket.join(roomCode);
        
        socket.emit('join-success', { roomCode, playerName });
        
        // Notify host
        io.to(game.hostId).emit('player-joined', {
            players: game.players.map(p => ({ name: p.name, submitted: p.submitted }))
        });
        
        console.log(`${playerName} joined game ${roomCode}`);
    });

    // Player submits word
    socket.on('submit-word', ({ roomCode, playerName, word }) => {
        const game = games.get(roomCode);
        
        if (!game) {
            socket.emit('submit-error', { message: 'Game not found!' });
            return;
        }
        
        const player = game.players.find(p => p.id === socket.id);
        if (player) {
            player.word = word;
            player.submitted = true;
            
            socket.emit('word-submitted');
            
            // Notify host
            io.to(game.hostId).emit('player-submitted', {
                players: game.players.map(p => ({ name: p.name, submitted: p.submitted }))
            });
            
            console.log(`${playerName} submitted word in game ${roomCode}`);
        }
    });

    // Host starts the game
    socket.on('start-game', ({ roomCode }) => {
        const game = games.get(roomCode);
        
        if (!game || game.hostId !== socket.id) {
            return;
        }
        
        game.gameStarted = true;
        game.gamePhase = 'playing';
        
        // Shuffle players
        const shuffled = [...game.players].sort(() => Math.random() - 0.5);
        
        const words = shuffled
            .filter(p => p.submitted)
            .map(p => p.word);
        
        // Send words to host
        io.to(game.hostId).emit('game-started', { words });
        
        // Notify all players
        io.to(roomCode).emit('game-phase-change', { phase: 'playing' });
        
        console.log(`Game ${roomCode} started`);
    });

    // Host reveals answers
    socket.on('reveal-answers', ({ roomCode }) => {
        const game = games.get(roomCode);
        
        if (!game || game.hostId !== socket.id) {
            return;
        }
        
        game.gamePhase = 'reveal';
        
        const results = game.players
            .filter(p => p.submitted)
            .map(p => ({ name: p.name, word: p.word }));
        
        // Send to everyone
        io.to(roomCode).emit('answers-revealed', { results });
        
        console.log(`Game ${roomCode} revealed answers`);
    });

    // Host resets the game
    socket.on('reset-game', ({ roomCode }) => {
        const game = games.get(roomCode);
        
        if (!game || game.hostId !== socket.id) {
            return;
        }
        
        // Reset game state but keep players
        game.gameStarted = false;
        game.gamePhase = 'submission';
        game.players.forEach(p => {
            p.word = null;
            p.submitted = false;
        });
        
        // Notify everyone
        io.to(roomCode).emit('game-reset');
        
        console.log(`Game ${roomCode} reset`);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Find and clean up games
        games.forEach((game, roomCode) => {
            // If host disconnects, end the game
            if (game.hostId === socket.id) {
                io.to(roomCode).emit('host-disconnected');
                games.delete(roomCode);
                console.log(`Game ${roomCode} deleted - host disconnected`);
            } else {
                // Remove player from game
                const playerIndex = game.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    const playerName = game.players[playerIndex].name;
                    game.players.splice(playerIndex, 1);
                    
                    // Notify host
                    io.to(game.hostId).emit('player-left', {
                        playerName,
                        players: game.players.map(p => ({ name: p.name, submitted: p.submitted }))
                    });
                    
                    console.log(`${playerName} left game ${roomCode}`);
                }
            }
        });
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n🎮 Word Guessing Game Server Started!');
    console.log('========================================');
    console.log(`\n📍 Local access (Host):`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n📱 Network access (Players on phones):`);
    console.log(`   http://${localIP}:${PORT}`);
    console.log('\n========================================');
    console.log(`\n✅ Share this URL with your friends: http://${localIP}:${PORT}\n`);
});
