let loginNotif = document.getElementById("login-notif");

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission behavior
    // Perform your login logic here

    // Example: Log the entered username and password to the console
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    fetch("http://localhost:3000/api/admin/login", {
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
          window.location.replace("http://localhost:3000/admin/dashboard");
        }
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  });
