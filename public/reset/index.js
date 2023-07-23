document
  .getElementById("resetForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value;

    fetch("/api/resetpassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {
        console.error("Error:", error);
      });
  });
