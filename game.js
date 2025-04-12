const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// משתנים למשחק
let playerLives = 3;
let score = 0;
let gameOver = false;

let animationFrameId = null;

// הגדרת מהירות בסיסית
let enemySpeed = 1;
let enemyBulletSpeed = 2;
let enemySpeedIncreaseCount = 0;

// משתנה לזמן ההאצה
let lastSpeedIncreaseTime = Date.now();

// אזור תנועה של החללית (40% מהמסך התחתון)
const playerMovementAreaHeight = canvasHeight * 0.4;

// יצירת החללית של השחקן
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
if (config.shipColor) {
    player.color = config.shipColor;
}
let shootKey = config.shootKey || " ";

// יצירת החלליות הרעות 4x5
const enemyRows = 4;
const enemyCols = 5;
const enemies = [];
const enemyWidth = 40;
const enemyHeight = 20;
const enemyGap = 10;
let enemyDirection = 1; // 1 לימין, -1 לשמאל

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

// קליע של אויבים
let enemyBullets = [];
let lastEnemyShotTime = 0;

// תנועת השחקן
const keys = {};
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === shootKey) {
        player.bullets.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 10,
            color: config.bulletColor || "purple",
        });
    }
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

    // עדכון קליעי השחקן
    for (let b of player.bullets) {
        b.y -= 5;
    }
    player.bullets = player.bullets.filter((b) => b.y + b.height > 0);
}

function updateEnemies() {
    // בדיקת קצה
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

    // ירי של אויבים
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
    // פגיעות של קליעים באויבים
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
                score += 5 * (4 - e.rowIndex);
                player.bullets.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }

    // פגיעות של קליע אויב בשחקן
    for (let b of enemyBullets) {
        if (
            b.x < player.x + player.width &&
            b.x + b.width > player.x &&
            b.y < player.y + player.height &&
            b.y + b.height > player.y
        ) {
            playerLives--;
            enemyBullets = [];
            player.x = (canvasWidth / 2) - (player.width / 2);
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

function drawObject(o) {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawObject(player);
    for (let b of player.bullets) drawObject(b);
    for (let e of enemies) drawObject(e);
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

document.getElementById("startButton").addEventListener("click", () => {
    startGame();
    document.getElementById("gameCanvas").focus();
});


