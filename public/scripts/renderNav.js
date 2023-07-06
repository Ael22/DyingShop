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
    const script = document.createElement("script");
    script.src = "./scripts/cart.js";
    document.head.appendChild(script);
    // Handle the response data
  })
  .catch((error) => {
    // Handle the error
    console.log(error);
  });
