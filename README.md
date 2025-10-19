# 📝 Paper Game - Multiplayer Edition

A real-time multiplayer word guessing game with a sketchy, hand-drawn aesthetic. Players submit words from their phones, and the host reads them aloud!

## 🚀 Setup Instructions

### 1. Install Node.js
If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies
Open terminal/command prompt in the project folder and run:
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```

The server will automatically detect your local IP and start on port 3000.

## 📱 How to Play

### For the Host (Game Master):
1. Go to the game url.
2. Click **"🖥️ Host a Game"**
3. Enter **WiFi network name** and **password** for your players
4. Click **"Create Game"** - you'll get a room code instantly
5. Share the room code or QR code with your friends
6. Wait for everyone to join and submit their **English words only**
7. Click **"Start Game"** when at least 2 players have submitted words
8. Click **"Read All Words"** to hear all words with different AI voices
9. Use **"Repeat"** to hear them again
10. Play the guessing game with your friends!
11. Click **"Reveal Answers"** to show who wrote what

### For Players (On Phones):
1. Connect to the WiFi network shown by the host
2. **Scan the QR code** with your phone camera, or
3. Open a browser and go to the **join URL** displayed by the host
4. Click **"📱 Join a Game"**
5. Enter the **room code** and your **name**
6. Submit your **secret English word**
7. Wait for the game to start
8. Listen to the words (each spoken by a different voice!)
9. Guess who wrote what with your group
10. See the reveal at the end

## ✨ Features

- ✅ **Sketchy Paper Theme**: Hand-drawn aesthetic with dashed borders and pastel colors
- ✅ **Multiple AI Voices**: Each word is read by a different voice for variety
- ✅ **QR Code Support**: Easy mobile joining via QR code scanning
- ✅ **Custom WiFi Setup**: Host configures network details for each game
- ✅ **Auto IP Detection**: Server automatically detects and uses your LAN IP
- ✅ **Real-time Multiplayer**: Live updates using Socket.IO
- ✅ **Mobile-Optimized**: Responsive design for phones and tablets
- ✅ **Room Code System**: Simple 6-letter codes for easy joining
- ✅ **Live Player Status**: See who's joined and submitted words
- ✅ **English-Only Prompts**: Clear instructions for better speech synthesis
- ✅ **No Popups**: Clean, uninterrupted gameplay experience
- ✅ **Paper-Themed Emojis**: Consistent iconography (📝, 📄, ✏️, 🗒️, 📑)

## 🎯 Game Rules

1. **English words only** - for best speech synthesis results
2. Each player submits one secret word
3. Host reads all words aloud using a voice
4. Players discuss and guess who submitted each word
5. Host reveals the answers showing player names and their words
6. Minimum 2 players required to start

## 🛠️ Troubleshooting

### Players can't join via QR code:
- Make sure everyone is connected to the WiFi network specified by the host
- Try typing the join URL manually instead of scanning
- Ensure the host's computer and player phones are on the same network

### No sound when reading words:
- Use Chrome, Edge, or Safari for best Web Speech API support
- Check your computer's volume and browser sound settings
- Make sure the host's device has speakers/headphones connected
- Try refreshing the host page if voices don't load

### Connection issues:
- Check that port 3000 isn't blocked by firewall
- Verify all devices are on the same WiFi network
- Try restarting the server with `npm start`

### Game doesn't start:
- Ensure at least 2 players have submitted words
- Check that players entered English words only
- Refresh the host page if the start button stays disabled

## 🎨 Design Theme

The game features a **sketchy paper aesthetic** with:
- Hand-drawn fonts (Patrick Hand, Gloria Hallelujah, Caveat)
- Dashed borders and offset shadows
- Pastel color palette with paper-like textures
- Slight rotations for organic feel
- Paper-themed emojis throughout

## 📝 Development Mode

For development with auto-restart:
```bash
npm run dev
```

## 🔧 Customization

### Changing the Port
Edit `server.js` and modify:
```javascript
const PORT = process.env.PORT || 3000;
```

### Voice Settings
Speech synthesis options can be adjusted in `host.js`:
- Voice cycling through available system voices
- Speech rate, pitch, and volume controls
- Timeout between words (currently 1.5 seconds)

### Styling
The sketchy theme can be customized in `public/style.css`:
- Color palette in `:root` CSS variables
- Border styles and rotations
- Font selections and sizes

## 🎉 Perfect For

- **Party games** with friends and family
- **Ice breakers** at events and gatherings  
- **Creative writing** exercises and prompts
- **Team building** activities
- **Language learning** practice (English focus)

Enjoy your paper game sessions! 📝✨ 
