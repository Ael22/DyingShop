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

const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
// eslint-disable-next-line no-unused-vars
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

const formNotif = document.getElementById("form-notif");

let count = 5;

function redirectCounter() {
  formNotif.textContent = `Sign up success! Redirecting to login page in ${count} seconds!`;
  count -= 1;

  if (count >= 0) {
    setTimeout(redirectCounter, 1000);
  } else {
    window.location.href = "/login";
  }
}

document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    const firstName = document.getElementById("firstNameInput").value;
    const lastName = document.getElementById("lastNameInput").value;

    fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.err_msg) {
          throw data.err_msg;
        } else if (data.success_msg) {
          formNotif.className = "text-success";
          redirectCounter();
        }
      })
      .catch((error) => {
        formNotif.className = "text-danger";
        formNotif.textContent = error;
      });
  });
