/* eslint-disable no-multi-assign */
/* eslint-disable camelcase */
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
// eslint-disable-next-line no-unused-vars
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
let count = 5;

function redirectCounter() {
  document.getElementById(
    "form-notif"
  ).textContent = `Account Deleted. Redirecting to home page in ${count} seconds!`;
  count -= 1;

  if (count >= 0) {
    setTimeout(redirectCounter, 1000);
  } else {
    window.location.href = "/";
  }
}

function fetchVerifyEmail() {
  document.getElementById("verifyEmailBtn").disabled = true;
  document.getElementById(
    "verifyEmailBtn"
  ).innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-lg" style="color: #ffffff;"></i>`;
  fetch("/api/user/verifyemail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success_msg) {
        document.getElementById("verifyBtnInfo").textContent = data.success_msg;
      } else if (data.err_msg === "User is already verified") {
        window.location.reload();
      } else {
        document.getElementById(
          "verifyBtnInfo"
        ).textContent = `Failed to send verification email`;
      }
      document.getElementById("verifyEmailBtn").innerHTML = "Verify Email";
      document.getElementById("verifyEmailBtn").disabled = false;
    });
}

fetch("/api/user", {
  method: "GET",
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    const { email, first_name, last_name, created_at, verified } = data.user;
    if (!verified) {
      document.getElementById(
        "profileHeader"
      ).innerHTML += ` <span class="badge text-bg-danger ms-2">Unverified</span>`;
      document.getElementById(
        "verifyInfo"
      ).innerHTML = `Click on the link to verify your E-mail. <button type="button" id="verifyEmailBtn" class="btn btn-success ms-2">Verify Email</button>`;
      document
        .getElementById("verifyEmailBtn")
        .addEventListener("click", () => {
          fetchVerifyEmail();
        });
    } else {
      document.getElementById(
        "profileHeader"
      ).innerHTML += ` <span class="badge text-bg-success ms-2">Verified</span>`;
      document.getElementById("verifyInfo").innerHTML = "";
    }
    document.getElementById("emailInput").value = email;
    document.getElementById("firstNameInput").value = first_name;
    document.getElementById("lastNameInput").value = last_name;
    document.getElementById(
      "userCreatedAt"
    ).innerHTML = `Account created on ${new Date(created_at).toLocaleString()}`;
  })
  .catch((error) => {
    console.error(error);
  });

document
  .getElementById("updateForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    document.getElementById("updateBtn").disabled = true;
    document.getElementById("deleteBtn").disabled = true;
    document.getElementById(
      "updateBtn"
    ).innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-lg" style="color: #ffffff;"></i>`;

    fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: document.getElementById("emailInput").value,
        firstName: document.getElementById("firstNameInput").value,
        lastName: document.getElementById("lastNameInput").value,
        password: document.getElementById("currentPasswordInput").value,
        newPassword: document.getElementById("newPasswordInput").value,
        confirmPassword: document.getElementById("confirmPasswordInput").value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("updateBtn").disabled = false;
        document.getElementById("deleteBtn").disabled = false;
        document.getElementById("updateBtn").innerHTML = "Update Details";
        if (data.err_msg) {
          document.getElementById("form-notif").className = "text-danger";
          document.getElementById("form-notif").innerText = data.err_msg;
        } else {
          document.getElementById("form-notif").className = "text-success";
          document.getElementById("form-notif").innerText = data.success_msg;
          document.getElementById("currentPasswordInput").value =
            document.getElementById("newPasswordInput").value =
            document.getElementById("confirmPasswordInput").value =
              "";
        }
      });
  });

document.getElementById("deleteBtn").addEventListener("click", () => {
  deleteModal.show();
});

document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  document.getElementById("updateBtn").disabled = true;
  document.getElementById("deleteBtn").disabled = true;

  document.getElementById(
    "deleteBtn"
  ).innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-lg" style="color: #ffffff;"></i>`;

  fetch("/api/user", {
    method: "DELETE",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("updateBtn").innerHTML = "Update Details";
      if (data.err_msg) {
        document.getElementById("form-notif").className = "text-danger";
        document.getElementById("form-notif").innerText = data.err_msg;
      } else {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.getElementById("form-notif").className = "text-success";
        deleteModal.hide();
        redirectCounter();
      }
    });
});
