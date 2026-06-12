const socket = io();

socket.on('timerUpdate', (timer) => {
  document.getElementById('timer-display').innerText = timer + 's';
});

socket.on('gameUpdated', ({ room }) => {
  document.getElementById('score-a').innerText = room.teamScores['Team A'];
  document.getElementById('score-b').innerText = room.teamScores['Team B'];
  
  // Show/Hide buzzer based on state
  const btnBuzz = document.getElementById('btn-buzz');
  if(room.gameState === 'buzzer') btnBuzz.classList.remove('hidden');
  else btnBuzz.classList.add('hidden');
  
  // Show/Hide input based on control
  if(room.controllingTeam === socket.id) {
    document.getElementById('guess-form').classList.remove('hidden');
  }
});
// Ensure you have a listener for gameUpdated to call renderGame(room)
socket.on('gameUpdated', ({ room, hostDialogue }) => {
  renderGame(room);
  document.getElementById('ai-text').innerText = hostDialogue;
});
});

document.getElementById('btn-join').addEventListener('click', () => {
  const name = document.getElementById('player-name').value.trim() || 'Player';
  const code = document.getElementById('room-code-input').value.trim();
  if (code) {
    socket.emit('joinRoom', { roomCode: code, playerName: name });
  } else {
    alert("Please enter a room code.");
  }
});

// -------------------------
// SOCKET LISTENERS
// -------------------------
socket.on('connect', () => {
  myId = socket.id;
});

socket.on('error', (msg) => {
  alert(msg);
});

socket.on('roomUpdated', ({ room, hostDialogue }) => {
  currentRoomCode = room.code;
  updateAIHost(hostDialogue);
  
  if (room.gameState === 'lobby') {
    switchView('lobby');
    document.getElementById('display-room-code').innerText = room.code;
    
    const list = document.getElementById('player-list');
    list.innerHTML = '';
    room.players.forEach(p => {
      const li = document.createElement('li');
      li.innerText = p.name;
      list.appendChild(li);
    });

    if (isHost && room.players.length >= 1) {
      const startBtn = document.getElementById('btn-start');
      startBtn.classList.remove('hidden');
      startBtn.onclick = () => socket.emit('startGame', { roomCode: room.code });
    }
  }
});

socket.on('gameUpdated', ({ room, hostDialogue }) => {
  updateAIHost(hostDialogue);
  switchView('game');
  renderGame(room);
});

// -------------------------
// GAME RENDERING LOGIC
// -------------------------
function renderGame(room) {
  const q = room.questions[room.currentQuestionIndex];
  if(!q) return;

  const me = room.players.find(p => p.id === myId);

  // 1. Update Question Text
  document.getElementById('current-question').innerText = q.question;

  // 2. Render Scoreboard
  const sb = document.getElementById('scoreboard');
  if (me.team === 'FFA') {
    sb.innerHTML = `<div>My Score: <span class="text-yellow-400">${me.score}</span></div>`;
  } else {
    sb.innerHTML = `
      <div class="${room.controllingTeam === 'Team A' ? 'text-yellow-400' : ''}">Team A: ${room.teamScores['Team A']}</div>
      <div class="${room.controllingTeam === 'Team B' ? 'text-yellow-400' : ''}">Team B: ${room.teamScores['Team B']}</div>
    `;
  }

  // 3. Render Board (Flip Cards)
  const board = document.getElementById('the-board');
  board.innerHTML = '';
  q.answers.forEach((ans, index) => {
    const isRevealed = room.revealedAnswers.includes(index);
    const card = document.createElement('div');
    card.className = `flip-card ${isRevealed ? 'flipped' : ''}`;
    card.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">${index + 1}</div>
        <div class="flip-card-back">
          <span>${ans.text.toUpperCase()}</span>
          <span class="bg-white text-black px-2 rounded">${ans.points}</span>
        </div>
      </div>
    `;
    board.appendChild(card);
  });

  // 4. Render Strikes
  const strikesContainer = document.getElementById('strikes-container');
  strikesContainer.innerHTML = '';
  for(let i=0; i<room.strikes; i++) {
    strikesContainer.innerHTML += `<span class="strike-x">X</span>`;
  }

  // 5. Interaction State Management
  const btnBuzz = document.getElementById('btn-buzz');
  const guessForm = document.getElementById('guess-form');
  const btnNext = document.getElementById('btn-next-round');

  btnBuzz.classList.add('hidden');
  guessForm.classList.add('hidden');
  btnNext.classList.add('hidden');

  if (room.gameState === 'buzzer') {
    btnBuzz.classList.remove('hidden');
  } 
  else if (room.gameState === 'playing' || room.gameState === 'steal') {
    // Check if I have control
    const haveControl = (me.team === 'FFA' && room.controllingTeam === me.id) || 
                        (me.team !== 'FFA' && room.controllingTeam === me.team);
    if (haveControl) {
      guessForm.classList.remove('hidden');
      document.getElementById('guess-input').focus();
    }
  }
  else if (room.gameState === 'roundOver') {
    if (isHost) btnNext.classList.remove('hidden');
  }
}

// -------------------------
// INPUT LISTENERS
// -------------------------
document.getElementById('btn-buzz').addEventListener('click', () => {
  socket.emit('buzz', { roomCode: currentRoomCode });
});

document.getElementById('btn-submit-guess').addEventListener('click', submitGuess);
document.getElementById('guess-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitGuess();
});

function submitGuess() {
  const input = document.getElementById('guess-input');
  const val = input.value.trim();
  if (val) {
    socket.emit('submitGuess', { roomCode: currentRoomCode, guess: val });
    input.value = '';
  }
}

document.getElementById('btn-next-round').addEventListener('click', () => {
  socket.emit('nextRound', { roomCode: currentRoomCode });
});
