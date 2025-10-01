# 🎮 Word Guessing Game - Multiplayer Edition

A real-time multiplayer word guessing game where everyone submits words from their phones and the host reads them aloud!

## 🚀 Setup Instructions

### 1. Install Node.js
If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies
Open PowerShell in the PaperGame folder and run:
```powershell
npm install
```

### 3. Start the Server
```powershell
npm start
```

The server will start on port 3000.

### 4. Find Your IP Address
To let others connect from their phones, you need your computer's IP address:
```powershell
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x)

## 📱 How to Play

### For the Host (Game Master):
1. Open a browser and go to: `http://localhost:3000`
2. Click **"Host a Game"**
3. Click **"Create New Game"**
4. Share the **room code** with your friends
5. Wait for everyone to join and submit their words
6. Click **"Start Game"** when ready
7. Click **"Read All Words"** to hear all words spoken aloud
8. Use **"Repeat"** to hear them again
9. Play the guessing game with your friends!
10. Click **"Reveal Answers"** to show who wrote what

### For Players (On Phones):
1. Connect to the same WiFi as the host
2. Open a browser on your phone
3. Go to: `http://[HOST_IP]:3000` (replace [HOST_IP] with the host's IP address)
   - Example: `http://192.168.1.100:3000`
4. Click **"Join a Game"**
5. Enter the **room code** and your **name**
6. Submit your **secret word**
7. Wait for the game to start
8. Listen to the words and guess!
9. See the reveal at the end

## ✨ Features

- ✅ Real-time multiplayer using Socket.IO
- ✅ Text-to-speech reads words aloud automatically
- ✅ Room codes for easy joining
- ✅ Mobile-friendly interface
- ✅ Multiple games can run simultaneously
- ✅ Live player status updates
- ✅ Automatic word shuffling
- ✅ Beautiful, modern UI

## 🎯 Game Rules

1. Each player submits a secret word
2. The host reads all words aloud (in random order)
3. Players try to guess who submitted each word
4. At the end, reveal shows everyone's words

## 🛠️ Troubleshooting

### Players can't connect:
- Make sure everyone is on the same WiFi network
- Check your firewall isn't blocking port 3000
- Verify you're using the correct IP address

### No sound when reading words:
- Make sure your browser supports Web Speech API (Chrome, Edge work best)
- Check your computer's volume settings
- Try refreshing the page

### Server won't start:
- Make sure port 3000 isn't already in use
- Try running: `npm install` again

## 📝 Development Mode

For development with auto-restart:
```powershell
npm run dev
```

## 🔧 Changing the Port

Edit `server.js` and change:
```javascript
const PORT = process.env.PORT || 3000;
```

Then connect using the new port number.

## 🎉 Have Fun!

Enjoy playing with your friends!
"# PaperGameHelper" 
