import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize core services
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Serve frontend from the 'public' folder
app.use(express.static('public'));

// Setup AI
const aiKey = process.env.GEMINI_API_KEY;
const genAI = aiKey ? new GoogleGenerativeAI(aiKey) : null;

// Real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('createRoom', (data) => {
    // Basic room handling
    socket.emit('roomUpdated', { room: { code: 'TEST', players: [] } });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
    const room = rooms[roomCode];
    clearInterval(room.timerInterval);
    // Logic: If guess correct, add points. If steal phase, points * 2.
    // If incorrect, strike++. If 3 strikes, set gameState = 'steal'.
    io.to(roomCode).emit('gameUpdated', { room });
  });
});

httpServer.listen(3000);
  socket.on('startGame', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    room.players.forEach((p, idx) => p.team = room.players.length <= 3 ? 'FFA' : (idx % 2 === 0 ? 'Team A' : 'Team B'));
    room.gameState = 'buzzer';
    const dialogue = await fetchAIHostDialogue(`The game is starting! The category is: "${room.questions[room.currentQuestionIndex].question}". Players, get ready to buzz in!`);
    io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
  });

  socket.on('buzz', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.gameState !== 'buzzer') return;
    const player = room.players.find(p => p.id === socket.id);
    room.controllingTeam = player.team === 'FFA' ? player.id : player.team;
    room.gameState = 'playing';
    io.to(roomCode).emit('gameUpdated', { room, hostDialogue: `${player.name} buzzed in! Give us your answer.` });
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  socket.on('startGame', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    room.players.forEach((p, idx) => p.team = room.players.length <= 3 ? 'FFA' : (idx % 2 === 0 ? 'Team A' : 'Team B'));
    room.gameState = 'buzzer';
    const dialogue = await fetchAIHostDialogue(`Start the game! The category is: "${room.questions[room.currentQuestionIndex].question}". Tell players to get ready to BUZZ IN.`);
    io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
  });

  socket.on('buzz', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.gameState !== 'buzzer') return;
    const player = room.players.find(p => p.id === socket.id);
    room.controllingTeam = player.team === 'FFA' ? player.id : player.team;
    room.gameState = 'playing';
    io.to(roomCode).emit('gameUpdated', { room, hostDialogue: `${player.name} buzzed in!` });
  });

  // ... (Keep existing submitGuess and nextRound logic here) ...
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running`));
  { id: 13, question: "Name a pet that doesn't make any noise.", answers: [ {text: "fish", points: 60, keywords: ["fish", "goldfish"]}, {text: "turtle", points: 18, keywords: ["turtle", "tortoise"]}, {text: "snake", points: 10, keywords: ["snake", "lizard", "reptile"]}, {text: "rock", points: 6, keywords: ["pet rock", "rock"]}, {text: "hamster", points: 4, keywords: ["hamster", "gerbil"]} ] },
  { id: 14, question: "Name something you might find at the bottom of a woman's purse.", answers: [ {text: "coins", points: 40, keywords: ["coins", "money", "change"]}, {text: "keys", points: 22, keywords: ["keys", "car keys"]}, {text: "lip balm", points: 15, keywords: ["lipstick", "lip balm", "makeup", "gloss"]}, {text: "receipts", points: 12, keywords: ["receipts", "paper", "trash"]}, {text: "mints", points: 6, keywords: ["mints", "gum", "candy"]} ] },
  { id: 15, question: "Name something that turns yellow as it ages.", answers: [ {text: "paper", points: 48, keywords: ["paper", "books", "pages"]}, {text: "teeth", points: 26, keywords: ["teeth", "tooth"]}, {text: "banana", points: 14, keywords: ["banana", "fruit"]}, {text: "leaves", points: 8, keywords: ["leaves", "leaf"]}, {text: "bruise", points: 3, keywords: ["bruise", "skin"]} ] },
  { id: 16, question: "Name a popular topping for pizza besides pepperoni.", answers: [ {text: "mushrooms", points: 35, keywords: ["mushrooms", "mushroom"]}, {text: "sausage", points: 28, keywords: ["sausage"]}, {text: "onions", points: 15, keywords: ["onions", "onion"]}, {text: "peppers", points: 12, keywords: ["peppers", "bell peppers", "green peppers"]}, {text: "pineapple", points: 6, keywords: ["pineapple"]} ] },
  { id: 17, question: "Name something people do when they are nervous.", answers: [ {text: "bite nails", points: 44, keywords: ["nails", "bite nails", "biting nails"]}, {text: "shake", points: 22, keywords: ["shake", "tremble", "fidget"]}, {text: "sweat", points: 14, keywords: ["sweat", "sweating"]}, {text: "pace", points: 10, keywords: ["pace", "pacing", "walk"]}, {text: "stutter", points: 6, keywords: ["stutter", "ramble", "talk fast"]} ] },
  { id: 18, question: "Name a job where you wear a uniform.", answers: [ {text: "police officer", points: 40, keywords: ["police", "cop", "officer"]}, {text: "nurse", points: 25, keywords: ["nurse", "doctor", "scrubs"]}, {text: "firefighter", points: 18, keywords: ["firefighter", "fireman"]}, {text: "pilot", points: 10, keywords: ["pilot", "flight attendant"]}, {text: "military", points: 5, keywords: ["soldier", "military", "army"]} ] },
  { id: 19, question: "Name an animal that is known for being incredibly slow.", answers: [ {text: "sloth", points: 52, keywords: ["sloth"]}, {text: "snail", points: 26, keywords: ["snail", "slug"]}, {text: "turtle", points: 14, keywords: ["turtle", "tortoise"]}, {text: "koala", points: 5, keywords: ["koala"]}, {text: "chameleon", points: 2, keywords: ["chameleon"]} ] },
  { id: 20, question: "Name something you expect to find inside a haunted house.", answers: [ {text: "ghosts", points: 45, keywords: ["ghost", "ghosts", "spirits"]}, {text: "cobwebs", points: 25, keywords: ["cobwebs", "spider webs", "dust"]}, {text: "bats", points: 15, keywords: ["bats", "bat"]}, {text: "blood", points: 10, keywords: ["blood", "gore"]}, {text: "skeletons", points: 5, keywords: ["skeleton", "bones", "skulls"]} ] }
];

// FUZZY STRING MATCHING HELPER
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[a.length][b.length];
}

function checkFuzzyMatch(guess, keywords) {
  const normalizedGuess = guess.toLowerCase().trim();
  return keywords.some(k => {
    const kw = k.toLowerCase();
    if (normalizedGuess === kw) return true;
    if (kw.includes(normalizedGuess) && normalizedGuess.length > 3) return true;
    return levenshteinDistance(normalizedGuess, kw) <= 1;
  });
}

// 3. AI HOST INTERACTION HELPER
async function fetchAIHostDialogue(promptText) {
  if (!ai) return "Let's see what's on the board!";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: "You are an energetic, funny, and witty television Game Show Host for Family Feud. Keep responses brief, engaging, and under 3 short sentences.",
        temperature: 0.7,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("AI Error:", error);
    return "The crowd goes wild! Let's see how our players handle this next one.";
  }
}

// 4. REAL-TIME WEBSOCKET (SOCKET.IO) MANAGEMENT
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', async ({ playerName }) => {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      players: [{ id: socket.id, name: playerName, team: null, score: 0 }],
      gameState: 'lobby', // 'lobby', 'buzzer', 'playing', 'steal', 'roundOver'
      questions: [...baseQuestions].sort(() => 0.5 - Math.random()), 
      currentQuestionIndex: 0,
      revealedAnswers: [],
      strikes: 0,
      teamScores: { 'Team A': 0, 'Team B': 0, 'FFA': 0 },
      controllingTeam: null
    };

    socket.join(roomCode);
    const dialogue = await fetchAIHostDialogue(`A new game room has been created by ${playerName}. Welcome them warmly.`);
    io.to(roomCode).emit('roomUpdated', { room: rooms[roomCode], hostDialogue: dialogue });
  });

  socket.on('joinRoom', async ({ roomCode, playerName }) => {
    const room = rooms[roomCode?.toUpperCase()];
    if (!room) return socket.emit('error', 'Room not found.');
    if (room.gameState !== 'lobby') return socket.emit('error', 'Game already in progress.');

    room.players.push({ id: socket.id, name: playerName, team: null, score: 0 });
    socket.join(roomCode.toUpperCase());

    const dialogue = await fetchAIHostDialogue(`A new player named ${playerName} has joined the lobby. Give them a quick greeting.`);
    io.to(roomCode.toUpperCase()).emit('roomUpdated', { room, hostDialogue: dialogue });
  });

  socket.on('startGame', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.players.length <= 3) {
      room.players.forEach(p => p.team = 'FFA');
    } else {
      room.players.forEach((p, idx) => { p.team = (idx % 2 === 0) ? 'Team A' : 'Team B'; });
    }

    room.gameState = 'buzzer';
    const q = room.questions[room.currentQuestionIndex];
    
    const dialogue = await fetchAIHostDialogue(`The game is starting! Introduce the first category: "${q.question}". Tell players to get ready to buzz in!`);
    io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
  });

  socket.on('buzz', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.gameState !== 'buzzer') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    room.controllingTeam = player.team === 'FFA' ? player.id : player.team;
    room.gameState = 'playing';

    const dialogue = await fetchAIHostDialogue(`${player.name} buzzed in first! Ask them for their answer.`);
    io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
  });

  socket.on('submitGuess', async ({ roomCode, guess }) => {
    const room = rooms[roomCode];
    if (!room || (room.gameState !== 'playing' && room.gameState !== 'steal')) return;

    const q = room.questions[room.currentQuestionIndex];
    const player = room.players.find(p => p.id === socket.id);
    
    let matchedAnswerIndex = -1;
    for (let i = 0; i < q.answers.length; i++) {
      if (!room.revealedAnswers.includes(i) && checkFuzzyMatch(guess, q.answers[i].keywords)) {
        matchedAnswerIndex = i;
        break;
      }
    }

    if (matchedAnswerIndex !== -1) {
      // Correct Guess
      room.revealedAnswers.push(matchedAnswerIndex);
      const points = q.answers[matchedAnswerIndex].points;
      
      if (player.team === 'FFA') {
        player.score += points;
      } else {
        room.teamScores[room.controllingTeam] += points;
      }

      if (room.revealedAnswers.length === q.answers.length) {
        room.gameState = 'roundOver';
        const dialogue = await fetchAIHostDialogue(`They cleared the board! "${q.answers[matchedAnswerIndex].text}" was correct. Wrap up the round.`);
        io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
      } else {
        if (room.gameState === 'steal') room.gameState = 'roundOver'; // Steal was successful, end round
        const dialogue = await fetchAIHostDialogue(`"${q.answers[matchedAnswerIndex].text}" is on the board for ${points} points! Good answer.`);
        io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
      }
    } else {
      // Incorrect Guess
      if (room.gameState === 'steal') {
        room.gameState = 'roundOver'; // Steal failed, round over
        const dialogue = await fetchAIHostDialogue(`Strike! The steal failed. That's the end of the round.`);
        io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
      } else {
        room.strikes += 1;
        if (room.strikes >= 3 && player.team !== 'FFA') {
          room.gameState = 'steal';
          room.controllingTeam = room.controllingTeam === 'Team A' ? 'Team B' : 'Team A';
          const dialogue = await fetchAIHostDialogue(`Three strikes! The other team has a chance to steal the points!`);
          io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
        } else if (room.strikes >= 3 && player.team === 'FFA') {
          room.gameState = 'roundOver';
          const dialogue = await fetchAIHostDialogue(`Three strikes! That's the end of the round for this player.`);
          io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
        } else {
          const dialogue = await fetchAIHostDialogue(`Strike ${room.strikes}! That answer is not up there.`);
          io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
        }
      }
    }
  });

  socket.on('nextRound', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.currentQuestionIndex++;
    if (room.currentQuestionIndex >= room.questions.length) {
      room.gameState = 'gameOver';
      const dialogue = await fetchAIHostDialogue(`The game is over! Thank everyone for playing.`);
      io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
      return;
    }

    room.revealedAnswers = [];
    room.strikes = 0;
    room.controllingTeam = null;
    room.gameState = 'buzzer';

    const q = room.questions[room.currentQuestionIndex];
    const dialogue = await fetchAIHostDialogue(`Moving on to the next round. Hands on your buzzers! Category: "${q.question}"`);
    io.to(roomCode).emit('gameUpdated', { room, hostDialogue: dialogue });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Family Feud server running on port ${PORT}`);
});
