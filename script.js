window.addEventListener("load", () => {
    setupNavigation();
    loadPage("welcome");
  });
  
  function setupNavigation() {
    const links = document.querySelectorAll("nav a");
  
    links.forEach(link => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const page = link.getAttribute("data-page");
        loadPage(page);
      });
    });
  }
  
  function loadPage(page) {
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
  
function addFormHandlers(page) {
  if (page === "login") {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      if (username === "testuser" && password === "p@ssword1") {
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

      const password = document.getElementById("newPassword").value;
      const confirm = document.getElementById("confirmPassword").value;

      if (password !== confirm) {
        alert("The passwords do not match");
        return;
      }

      if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
        alert("The password must include at least 8 characters, one letter and one number");
        return;
      }

      alert("You have successfully registered! You can now log in");
      loadPage("login");
    });
  }
}
