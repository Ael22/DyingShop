const loginNotif = document.getElementById("login-notif");

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.err_msg) {
          loginNotif.textContent = data.err_msg;
          loginNotif.className = "text-danger";
        } else {
          loginNotif.textContent = "-";
          loginNotif.className = "text-light";
          // TODO: Send redirect
          window.location.href = "/admin/dashboard";
        }
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  });
