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

const urlString = window.location.href;
const url = new URL(urlString);
const params = new URLSearchParams(url.search);
const token = params.get("tokenId");

if (!token) {
  window.location.href = "/";
}

fetch("/api/verifyResetToken", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ token }),
}).then((response) => {
  if (!response.ok) {
    window.location.href = "/";
  }
});

document
  .getElementById("resetForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    document.getElementById("resetBtn").disabled = true;
    document.getElementById(
      "resetBtn"
    ).innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-lg" style="color: #ffffff;"></i>`;

    const newPassword = document.getElementById("newPasswordInput").value;
    const confirmPassword = document.getElementById(
      "confirmPasswordInput"
    ).value;

    fetch("/api/resetpassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success_msg) {
          document.getElementById("form-notif").className = "text-success";
          document.getElementById("form-notif").innerHTML = data.success_msg;
        } else {
          document.getElementById("form-notif").className = "text-danger";
          document.getElementById("form-notif").innerHTML = data.err_msg;
        }
        document.getElementById("resetBtn").disabled = false;
        document.getElementById("resetBtn").innerHTML = `Reset Password`;
      });
  });
