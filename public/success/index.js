function deleteCart() {
  if (sessionStorage.getItem("cartItems")) {
    sessionStorage.removeItem("cartItems");
  }
}

deleteCart();
