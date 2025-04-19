document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadPage("welcome");
});

function setupNavigation() {
  const links = document.querySelectorAll("a[data-page]:not(#about-btn)");
  const aboutBtn = document.getElementById("about-btn");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalClose = document.getElementById("modal-close");

  links.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = link.getAttribute("data-page");
      loadPage(page);
    });
  });

  if (aboutBtn && modalOverlay) {
    aboutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modalOverlay.classList.remove("hidden");
    });
  }

  if (modalOverlay && modalClose) {
    modalClose.addEventListener("click", () => {
      modalOverlay.classList.add("hidden");
    });

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.add("hidden");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        modalOverlay.classList.add("hidden");
      }
    });
    

  }
}

let loggedInUser = null; // Variable to track the logged-in user

function loadPage(page) {
  if (page === "game") {
    if (!loggedInUser) {
      if (!window._loginRedirectedOnce) {
        window._loginRedirectedOnce = true; // ✅ prevent future alerts
        alert("You must be logged in to access the game.");
        loadPage("login");
      }
      return;
    } else {
      // ✅ if user is logged in, allow game page to load
      window._loginRedirectedOnce = false;
    }
  }

  if (page === "login" && loggedInUser) {
    alert("You already log in");
    return;
  }

  if (page !== "game" && typeof stopGame === "function") {
    stopGame();
  }

  fetch(`pages/${page}.html`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Page not found");
      }
      return response.text();
    })
    .then(html => {
      document.getElementById("content").innerHTML = html;
      setupNavigation();
      if (page === "game") {
        loadScript("game.js", () => {
          if (typeof attachGameEvents === "function") {
            attachGameEvents();
          }
        });
      }
      addFormHandlers(page);
    })
    .catch(error => {
      document.getElementById("content").innerHTML = `<p>error while loading the page</p>`;
      console.error(error);
    });
}

function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = `${src}?v=${Date.now()}`;
  script.onload = () => {
    if (callback) callback();
  };
  document.body.appendChild(script);
}



function loadGameScript() {
  const script = document.createElement("script");
  script.src = "cannon.js";
  script.onload = () => {
    console.log("The game is loading..");
    if (typeof setupGame === "function") {
      setupGame();
    }
  };
  document.body.appendChild(script);
}

const users = [["p", "testuser"]]; // Data structure to store registered users

function addFormHandlers(page) {
  if (page === "login") {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const userExists = users.some(([storedUsername, storedPassword]) =>
        storedUsername === username && storedPassword === password);
      // Check if the user exists in the users array
      if (userExists) {
        loggedInUser = username;
        
        loadPage("config");
      } else {
        alert("Incorrect username or password");
      }
    });
  }

  else if (page === "config") {
    const configForm = document.getElementById("configForm");
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const shootKey = document.getElementById("shootKey").value;
      const gameDuration = parseInt(document.getElementById("gameDuration").value);
      const bulletColor = document.getElementById("bulletColor").value;
      if (gameDuration < 2) {
        alert("Minimum game duration is 2 minutes!");
        return;
      }
      // Save config to localStorage or global variable
      localStorage.setItem("gameConfig", JSON.stringify({
        shootKey,
        gameDuration,
        bulletColor
      }));
      loadPage("game");
    });
  }

  else if (page === "register") {
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("newUsername").value;
      const password = document.getElementById("newPassword").value;
      const confirm = document.getElementById("confirmPassword").value;
      // Check if the username already exists in the users array
      const usernameExists = users.some(([storedUsername]) => storedUsername === username);
      if (usernameExists) {
        alert("This username is already taken");
        return;
      }
      if (password !== confirm) {
        alert("The passwords do not match");
        return;
      }
      if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
        alert("The password must include at least 8 characters, one letter and one number");
        return;
      }
      users.push([username, password]); // Save the user credentials as a tuple
      alert("You have successfully registered! You can now log in");
      loadPage("login");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const aboutBtn = document.getElementById("about-btn");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalClose = document.getElementById("modal-close");

  if (aboutBtn && modalOverlay && modalClose) {
    aboutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modalOverlay.style.display = "flex";
    });

    modalClose.addEventListener("click", () => {
      modalOverlay.style.display = "none";
    });

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        modalOverlay.style.display = "none";
      }
    });
  }


  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loggedInUser = null;
      localStorage.removeItem("gameConfig");
      alert("You have been logged out.");
      loadPage("login");
    });
  }

});

let gameTimer = null;
let timeLeft = 0;

function startGameTimer(durationMinutes) {
  timeLeft = durationMinutes * 60;
  gameTimer = setInterval(() => {
    timeLeft--;
    console.log("Time left:", timeLeft, "seconds");
    if (timeLeft <= 0) {
      clearInterval(gameTimer);
      gameOver = true;
    }
  }, 1000);
}

function startGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  if (gameTimer) clearInterval(gameTimer);
  for (let key in keys) {
    keys[key] = false;
  }
  
  playerLives = 3;
  score = 0;
  gameOver = false;
  enemySpeed = 1;
  enemyBulletSpeed = 2;
  enemySpeedIncreaseCount = 0;
  lastSpeedIncreaseTime = Date.now();

  initialPlayerX = Math.random() * (canvasWidth - player.width);
  player.x = initialPlayerX;
  player.y = canvasHeight - 40;
  player.bullets = [];
  player.speed = 5;
  enemyBullets = [];
  enemies.length = 0;
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
  if (gameTimer) clearInterval(gameTimer);
  const config = JSON.parse(localStorage.getItem("gameConfig")) || {};
  const duration = config.gameDuration || 2;
  startGameTimer(duration);
  if (backgroundMusic) {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch(err => console.warn("Background music couldn't play:", err));
  }
  gameLoop();
}

function endGame() {
  if (gameTimer) clearInterval(gameTimer);
  gameOver = true;
}


