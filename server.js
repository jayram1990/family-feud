import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// 1. INITIALIZATION & SETUP
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

// Initialize Gemini SDK
const aiKey = process.env.GEMINI_API_KEY;
const ai = aiKey ? new GoogleGenerativeAI({ apiKey: aiKey }) : null;

// 2. IN-MEMORY GAME STORES
const rooms = {};

// Full Question Bank
const baseQuestions = [
  { id: 1, question: "Name something you bring with you to the beach.", answers: [ {text: "towel", points: 35, keywords: ["towel", "beach towel"]}, {text: "sunscreen", points: 25, keywords: ["sunscreen", "lotion", "sunblock"]}, {text: "umbrella", points: 15, keywords: ["umbrella", "shade"]}, {text: "sunglasses", points: 12, keywords: ["sunglasses", "shades", "glasses"]}, {text: "cooler", points: 8, keywords: ["cooler", "drinks", "food", "snacks"]} ] },
  { id: 2, question: "Name a common excuse for being late to work.", answers: [ {text: "traffic", points: 45, keywords: ["traffic", "car traffic", "jam"]}, {text: "overslept", points: 25, keywords: ["overslept", "alarm", "slept in"]}, {text: "car trouble", points: 15, keywords: ["car trouble", "flat tire", "dead battery"]}, {text: "sick", points: 8, keywords: ["sick", "ill", "doctor"]}, {text: "train delayed", points: 5, keywords: ["train", "bus", "transit", "transit delay"]} ] },
  { id: 3, question: "Name something people do as soon as they get home from work.", answers: [ {text: "change clothes", points: 42, keywords: ["change", "clothes", "pajamas"]}, {text: "take off shoes", points: 24, keywords: ["shoes", "boots", "footwear"]}, {text: "shower", points: 14, keywords: ["shower", "bath", "wash"]}, {text: "watch tv", points: 10, keywords: ["tv", "television", "netflix"]}, {text: "eat", points: 7, keywords: ["eat", "snack", "dinner"]} ] },
  { id: 4, question: "Name something you buy that gets ruined if it rains.", answers: [ {text: "newspaper", points: 38, keywords: ["newspaper", "paper", "book", "magazine"]}, {text: "shoes", points: 28, keywords: ["shoes", "suede", "sneakers"]}, {text: "cotton candy", points: 14, keywords: ["cotton candy", "candy"]}, {text: "cardboard box", points: 10, keywords: ["cardboard", "box"]}, {text: "bread", points: 6, keywords: ["bread", "food"]} ] },
  { id: 5, question: "Name a place where you are supposed to stay completely quiet.", answers: [ {text: "library", points: 50, keywords: ["library", "bookstore"]}, {text: "movie theater", points: 22, keywords: ["movie", "theater", "cinema"]}, {text: "church", points: 15, keywords: ["church", "temple", "mosque", "chapel"]}, {text: "courtroom", points: 8, keywords: ["court", "courtroom", "judge"]}, {text: "hospital", points: 3, keywords: ["hospital", "clinic"]} ] },
  { id: 6, question: "Name something you might find in a magician's top hat.", answers: [ {text: "rabbit", points: 55, keywords: ["rabbit", "bunny"]}, {text: "scarf", points: 18, keywords: ["scarf", "handkerchief", "ribbon"]}, {text: "cards", points: 12, keywords: ["cards", "playing cards"]}, {text: "wand", points: 8, keywords: ["wand", "magic wand"]}, {text: "dove", points: 4, keywords: ["dove", "bird"]} ] },
  { id: 7, question: "Name an activity that makes your muscles sore the next day.", answers: [ {text: "weightlifting", points: 40, keywords: ["weights", "lifting", "gym", "workout"]}, {text: "running", points: 26, keywords: ["running", "jogging", "sprinting"]}, {text: "moving furniture", points: 15, keywords: ["moving", "furniture", "lifting boxes"]}, {text: "hiking", points: 10, keywords: ["hiking", "climbing"]}, {text: "swimming", points: 5, keywords: ["swimming", "swim"]} ] },
  { id: 8, question: "Name a food that is difficult to eat cleanly while driving.", answers: [ {text: "taco", points: 42, keywords: ["taco", "burrito"]}, {text: "hamburger", points: 25, keywords: ["burger", "hamburger"]}, {text: "soup", points: 14, keywords: ["soup", "broth"]}, {text: "spaghetti", points: 10, keywords: ["spaghetti", "pasta", "noodles"]}, {text: "ice cream cone", points: 6, keywords: ["ice cream", "cone"]} ] },
  { id: 9, question: "Name something people complain about when flying on a plane.", answers: [ {text: "legroom", points: 38, keywords: ["legroom", "seats", "space", "cramped"]}, {text: "crying baby", points: 28, keywords: ["baby", "crying", "kids", "noise"]}, {text: "airplane food", points: 15, keywords: ["food", "meal", "airplane food"]}, {text: "delays", points: 11, keywords: ["delays", "late", "cancelled"]}, {text: "turbulence", points: 5, keywords: ["turbulence", "bumpy"]} ] },
  { id: 10, question: "Name a superhero whose name does NOT end with the word 'man'.", answers: [ {text: "wolverine", points: 30, keywords: ["wolverine"]}, {text: "thor", points: 24, keywords: ["thor"]}, {text: "hulk", points: 18, keywords: ["hulk", "incredible hulk"]}, {text: "wonder woman", points: 15, keywords: ["wonder woman"]}, {text: "captain america", points: 8, keywords: ["captain america", "captain"]} ] },
  { id: 11, question: "Name something you use to open a bottle of wine.", answers: [ {text: "corkscrew", points: 65, keywords: ["corkscrew", "opener", "bottle opener"]}, {text: "knife", points: 12, keywords: ["knife"]}, {text: "shoe", points: 8, keywords: ["shoe"]}, {text: "key", points: 5, keywords: ["key"]}, {text: "teeth", points: 3, keywords: ["teeth", "tooth"]} ] },
  { id: 12, question: "Name something that has a shell.", answers: [ {text: "turtle", points: 45, keywords: ["turtle", "tortoise"]}, {text: "egg", points: 25, keywords: ["egg"]}, {text: "snail", points: 15, keywords: ["snail"]}, {text: "crab", points: 10, keywords: ["crab", "lobster", "shrimp"]}, {text: "peanut", points: 3, keywords: ["peanut", "walnut", "nut"]} ] },
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
