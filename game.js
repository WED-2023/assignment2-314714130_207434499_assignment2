let canvas = null;
let ctx = null;
let canvasWidth = 800;
let canvasHeight = 600; 


const spaceshipImage = new Image();
spaceshipImage.src = "./photos1/ship.jpg";

const enemyImages = [
    new Image(), // Row 0
    new Image(), // Row 1
    new Image(), // Row 2
    new Image()  // Row 3
  ];
  
  enemyImages[0].src = "./photos1/enemy1.png";
  enemyImages[1].src = "./photos1/enemy2.png";
  enemyImages[2].src = "./photos1/enemy3.png";
  enemyImages[3].src = "./photos1/enemy4.png";


const shootSound = document.getElementById("shootSound");
const hitGoodSound = document.getElementById("hitGoodSound");
const hitBadSound = document.getElementById("hitBadSound");

let playerLives = 3;
let score = 0;
let gameOver = false;
let animationFrameId = null;
let enemySpeed = 1;
let enemyBulletSpeed = 2;
let enemySpeedIncreaseCount = 0;
let lastSpeedIncreaseTime = Date.now();
let initialPlayerX = null;
const playerMovementAreaHeight = canvasHeight * 0.4;
const player = {
    x: Math.random() * (canvasWidth - 40),
    y: canvasHeight - 40,
    width: 40,
    height: 20,
    color: "purple",
    speed: 5,
    bullets: [],
};

const config = JSON.parse(localStorage.getItem("gameConfig")) || {};
let shootKey = config.shootKey || " ";

const enemyRows = 4;
const enemyCols = 5;
const enemies = [];
const enemyWidth = 30;
const enemyHeight = 30;
const enemyGap = 10;
let enemyDirection = 1;

for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyCols; col++) {
        enemies.push({
            x: col * (enemyWidth + enemyGap) + 100,
            y: row * (enemyHeight + enemyGap) + 30,
            width: enemyWidth,
            height: enemyHeight,
            color: ["maroon", "red", "green", "blue"][row],
            rowIndex: row,
        });
    }
}

let enemyBullets = [];
let lastEnemyShotTime = 0;

const keys = {};
document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", shootKey].includes(e.key)) {
      e.preventDefault(); // ✅ Stop page from scrolling
    }
  
    keys[e.key] = true;
  
    if (e.key === shootKey) {
      player.bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        color: config.bulletColor || "purple",
      });
  
      if (shootSound) shootSound.play();
    }
  });
  
  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

function updatePlayer() {
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x + player.width < canvasWidth)
        player.x += player.speed;
    if (
        keys["ArrowUp"] && player.y > canvasHeight - playerMovementAreaHeight
    )
        player.y -= player.speed;
    if (keys["ArrowDown"] && player.y + player.height < canvasHeight)
        player.y += player.speed;
    for (let b of player.bullets) {
        b.y -= 5;
    }
    player.bullets = player.bullets.filter((b) => b.y + b.height > 0);
}

function updateEnemies() {
    let hitRight = false;
    let hitLeft = false;
    for (let e of enemies) {
        if (e.x + e.width >= canvasWidth) hitRight = true;
        if (e.x <= 0) hitLeft = true;
    }
    if ((enemyDirection === 1 && hitRight) || (enemyDirection === -1 && hitLeft)) {
        enemyDirection *= -1;
    }
    for (let e of enemies) {
        e.x += enemySpeed * enemyDirection;
    }
    const now = Date.now();
    if (
        now - lastEnemyShotTime > 500 &&
        (enemyBullets.length === 0 ||
            enemyBullets[enemyBullets.length - 1].y > canvasHeight * 0.25)
    ) {
        const shooters = enemies.filter((e) => e);
        const shooter = shooters[Math.floor(Math.random() * shooters.length)];
        if (shooter) {
            enemyBullets.push({
                x: shooter.x + shooter.width / 2 - 2.5,
                y: shooter.y + shooter.height,
                width: 5,
                height: 10,
                color: "black",
            });
            lastEnemyShotTime = now;
        }
    }

    for (let b of enemyBullets) {
        b.y += enemyBulletSpeed;
    }
    enemyBullets = enemyBullets.filter((b) => b.y < canvasHeight);
}

function checkCollisions() {
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const b = player.bullets[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (
                b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y
            ) {
                if (hitGoodSound) hitGoodSound.play();
                score += 5 * (4 - e.rowIndex);
                player.bullets.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }

    for (let b of enemyBullets) {
        if (
            b.x < player.x + player.width &&
            b.x + b.width > player.x &&
            b.y < player.y + player.height &&
            b.y + b.height > player.y
        ) {
            if (hitBadSound) hitBadSound.play();
            playerLives--;
            enemyBullets = [];
            player.x = player.x = initialPlayerX;
            player.y = canvasHeight - player.height - 10;
            if (playerLives === 0) gameOver = true;
            break;
        }
    }
}

function startGameTimer(durationMinutes) {
    timeLeft = durationMinutes * 60;
    gameTimer = setInterval(() => {
        if (gameOver) {
            clearInterval(gameTimer);
            return;
        }
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById("timerDisplay").textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            gameOver = true;
            document.getElementById("timerDisplay").textContent = "Time's up!";
        }
    }, 1000);
}

function increaseSpeed() {
    const now = Date.now();
    if (now - lastSpeedIncreaseTime >= 5000 && enemySpeedIncreaseCount < 4) {
        enemySpeed += 0.5;
        enemyBulletSpeed += 0.5;
        enemySpeedIncreaseCount++;
        lastSpeedIncreaseTime = now;
    }
}

function drawEnemy(e) {
    const img = enemyImages[e.rowIndex];
    if (img.complete) {
      ctx.drawImage(img, e.x, e.y, e.width, e.height);
    } else {
      // fallback while image is still loading
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x, e.y, e.width, e.height);
    }
  }

function drawObject(o) {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(spaceshipImage, player.x, player.y, player.width, player.height);

    for (let b of player.bullets) drawObject(b);
    for (let e of enemies) drawEnemy(e);
    for (let b of enemyBullets) drawObject(b);

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Lives: " + playerLives, 10, 40);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "36px Arial";
        ctx.fillText("Game Over", canvasWidth / 2 - 100, canvasHeight / 2);
    }

    if (enemies.length === 0) {
        ctx.fillStyle = "green";
        ctx.font = "36px Arial";
        ctx.fillText("You Win!", canvasWidth / 2 - 80, canvasHeight / 2);
    }
}

function stopGame() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
  }

function gameLoop() {
    if (!gameOver && enemies.length > 0) {
        updatePlayer();
        updateEnemies();
        checkCollisions();
        increaseSpeed();
    }
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}

window.addEventListener("load", () => {
    attachGameEvents();
  });
  
  function attachGameEvents() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    if (!canvas) {
        console.error("Canvas not found!");
        return;
      }

    canvas.style.backgroundImage = "url('./photos1/game background.jpg')";
    const startBtn = document.getElementById("startButton");
  
    if (startBtn && canvas) {
      console.log("Start button found. Binding click...");
      startBtn.addEventListener("click", () => {
        startGame();
        canvas.focus();
      });
    } else {
      // If not loaded yet, retry shortly
      console.log("Start button  not found. Binding click...");
      setTimeout(attachGameEvents, 100);
    }
  }


