document
  .getElementById("logout-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    fetch("http://localhost:3000/api/admin/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        const status = response.status;
        if (status === 200) {
          window.location.href = "http://localhost:3000";
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  });
