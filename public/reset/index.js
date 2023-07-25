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

document
  .getElementById("resetForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("resetBtn").disabled = true;
    document.getElementById(
      "resetBtn"
    ).innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-lg" style="color: #ffffff;"></i>`;

    const email = document.getElementById("emailInput").value;
    fetch("/api/resetpassword/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
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
        document.getElementById("resetBtn").innerHTML = `Reset Password`;
        document.getElementById("resetBtn").disabled = false;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
