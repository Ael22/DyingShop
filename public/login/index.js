fetch("/api/verifyCustomer", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({}),
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    if (data.success_msg) {
      window.location.href = "/";
    }
  })
  .catch((error) => {
    // Handle the error
    console.log(error);
  });

const formNotif = document.getElementById("form-notif");

let count = 5;

function redirectCounter() {
  formNotif.textContent = `Sign in success! Redirecting to home page in ${count} seconds!`;
  count -= 1;

  if (count >= 0) {
    setTimeout(redirectCounter, 1000);
  } else {
    window.location.href = "/";
  }
}

document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    document.getElementById(
      "signInBtn"
    ).innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-lg" style="color: #ffffff;"></i>`;

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("signInBtn").innerHTML = "Sign in";
        if (data.err_msg) {
          throw data.err_msg;
        } else if (data.token) {
          formNotif.className = "text-success";
          redirectCounter();
        }
      })
      .catch((error) => {
        formNotif.className = "text-danger";
        formNotif.textContent = error;
      });
  });
