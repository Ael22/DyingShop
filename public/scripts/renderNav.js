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
      document.getElementsByTagName("header")[0].innerHTML =
        "<navbar-customer-component></navbar-customer-component>";
    }

    if (data.err_msg === "Token expired") {
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    const script = document.createElement("script");
    if (
      window.location.pathname === "/product/" ||
      window.location.pathname === "/login/" ||
      window.location.pathname === "/signup/" ||
      window.location.pathname === "/reset/"
    ) {
      script.src = "../scripts/cart.js";
    } else if (
      window.location.pathname === "/user/settings/" ||
      window.location.pathname === "/user/orders/"
    ) {
      script.src = "../../scripts/cart.js";
    } else {
      script.src = "./scripts/cart.js";
    }
    document.head.appendChild(script);
    // Handle the response data
  })
  .catch((error) => {
    // Handle the error
    console.log(error);
  });
