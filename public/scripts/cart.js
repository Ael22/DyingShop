const shoppingCartModal = new bootstrap.Modal(
  document.getElementById("shoppingCartModal")
);

document.getElementById("cartBtn").addEventListener("click", () => {
  shoppingCartModal.show();
});
