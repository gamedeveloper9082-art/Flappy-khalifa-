const game = document.getElementById('game');
const character = document.getElementById('character');
const popup = document.getElementById('popup');
const scoreDisplay = document.getElementById('score');
const bestDisplay = document.getElementById('bestScore');
const startScreen = document.getElementById('startScreen');

// 🎵 Sounds
const bgMusic = new Audio('background.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;
const flapSound = new Audio('flap.mp3');
const hitSound = new Audio('hit.mp3');
const scoreSound = new Audio('score.mp3');

// 🧠 Game variables
let charY = 250;
let gravity = 0.25;   // smoother gravity
let velocity = 0;
let jumpPower = -5.8; // softer jump
let isGameOver = false;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let pillars = [];
let gameStarted = false;

bestDisplay.textContent = 'Best: ' + bestScore;

// 🖱️ Tap / Click Controls
document.addEventListener('click', () => {
  if (!gameStarted) {
    startGame();
  } else if (isGameOver) {
    restartGame();
  } else {
    velocity = jumpPower;
    flapSound.currentTime = 0;
    flapSound.play();
  }
});

function gameLoop() {
  if (!gameStarted || isGameOver) return;

  // ⚙️ Physics
  velocity += gravity;
  charY += velocity;
  if (charY < 0) charY = 0;
  if (charY > 560) gameOver();

  // 🐦 Update character
  character.style.top = charY + 'px';
  character.style.transform = `rotate(${velocity * 3}deg)`;

  // 🧱 Move pillars
  for (let i = 0; i < pillars.length; i++) {
    let p = pillars[i];
    p.x -= 1.8; // slower movement
    p.topEl.style.left = p.x + 'px';
    p.bottomEl.style.left = p.x + 'px';

    // 🧮 Scoring
    if (!p.passed && p.x + 60 < 100) {
      p.passed = true;
      score++;
      scoreSound.play();
      scoreDisplay.textContent = 'Score: ' + score;
    }

    // 💥 Collision detection
    if (
      100 < p.x + 60 &&
      140 > p.x &&
      (charY < p.gapY - 115 || charY + 40 > p.gapY + 115)
    ) {
      gameOver();
    }

    // 🧹 Remove old pillars
    if (p.x < -60) {
      game.removeChild(p.topEl);
      game.removeChild(p.bottomEl);
      pillars.splice(i, 1);
      i--;
    }
  }

  requestAnimationFrame(gameLoop);
}

function createPillar() {
  if (isGameOver || !gameStarted) return;

  const gapY = Math.random() * 200 + 150;
  const gapHeight = 230; // smoother gap

  const topEl = document.createElement('div');
  const bottomEl = document.createElement('div');

  topEl.className = 'pillar';
  bottomEl.className = 'pillar';

  // 🖼️ Different pillar images
  topEl.style.backgroundImage = "url('uppiller.png')";
  bottomEl.style.backgroundImage = "url('downpiller.png')";
  topEl.style.backgroundSize = 'cover';
  bottomEl.style.backgroundSize = 'cover';

  // 📏 Set heights and positions
  topEl.style.height = gapY - gapHeight / 2 + 'px';
  topEl.style.top = '0';
  topEl.style.left = '400px';

  bottomEl.style.height = 600 - (gapY + gapHeight / 2) + 'px';
  bottomEl.style.bottom = '0';
  bottomEl.style.left = '400px';

  game.appendChild(topEl);
  game.appendChild(bottomEl);

  pillars.push({ x: 400, gapY, topEl, bottomEl, passed: false });

  setTimeout(createPillar, 2200); // timing for next pillar
}

function startGame() {
  startScreen.style.display = 'none';
  gameStarted = true;
  bgMusic.play();
  createPillar();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  if (isGameOver) return;
  isGameOver = true;
  hitSound.play();
  bgMusic.pause();

  // 🏆 Save Best Score
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore);
  }

  // 🧾 Show popup with score
  popup.innerHTML = `
    <p>🎮 Game Over</p>
    <p>Score: ${score}</p>
    <p>Best: ${bestScore}</p>
    <p>Tap to Restart</p>
  `;
  popup.style.display = 'block';
}

function restartGame() {
  popup.style.display = 'none';
  pillars.forEach(p => {
    game.removeChild(p.topEl);
    game.removeChild(p.bottomEl);
  });
  pillars = [];
  charY = 250;
  velocity = 0;
  score = 0;
  scoreDisplay.textContent = 'Score: 0';
  isGameOver = false;
  bgMusic.currentTime = 0;
  bgMusic.play();
  createPillar();
  requestAnimationFrame(gameLoop);
}