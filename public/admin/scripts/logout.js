document
  .getElementById("logout-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    fetch("/api/admin/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        const { status } = response;
        if (status === 200) {
          window.location.href = "/";
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  });
