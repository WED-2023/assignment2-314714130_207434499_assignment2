document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadPage("welcome");
});
  
function setupNavigation() {
  const links = document.querySelectorAll("nav a:not(#about-btn)");
  const aboutBtn = document.getElementById("about-btn");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalClose = document.getElementById("modal-close");

  // Normal navigation pages
  links.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = link.getAttribute("data-page");
      loadPage(page);
    });
  });

  // ✅ About button triggers modal
  if (aboutBtn && modalOverlay) {
    aboutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modalOverlay.classList.remove("hidden");
    });
  }

  // ✅ Modal close logic
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

    if (page === "game" && !loggedInUser) {
      alert("You must be logged in to access the game.");
      loadPage("login"); // Redirect to the login page
      return;
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
          if (page === "game") {
          loadGameScript();
        }
        addFormHandlers(page);
      })
      .catch(error => {
        document.getElementById("content").innerHTML = `<p>שגיאה בטעינת הדף.</p>`;
        console.error(error);
      });
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
        alert("You have successfully connected!");
        loadPage("game");
      } else {
        alert("Incorrect username or password");
      }
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
});