/* eslint-disable no-unused-vars */
const shoppingCartModal = new bootstrap.Modal(
  document.getElementById("shoppingCartModal")
);

function getCartContents() {
  const cartItems = sessionStorage.getItem("cartItems");
  if (cartItems) {
    return JSON.parse(cartItems);
  }
  return [];
}

function addToCart(item) {
  const cartItems = getCartContents();
  const existingItem = cartItems.find((cartItem) => item.id === cartItem.id);

  if (existingItem) {
    cartItems.forEach((cartItem) => {
      if (cartItem.id === item.id) {
        cartItem.quantity += 1;
      }
    });
  } else {
    cartItems.push(item);
  }

  sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function editCartQty(editArr) {
  const cartItems = getCartContents();
  for (let i = 0; i < cartItems.length; i += 1) {
    cartItems[i].quantity = editArr[i];
  }

  sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
}

async function removeFromCart(itemId) {
  const cartItems = getCartContents();
  const updatedCartItems = cartItems.filter((cartItem) => {
    console.log(cartItem.id, itemId);
    // eslint-disable-next-line eqeqeq
    return cartItem.id != itemId;
  });
  console.log(updatedCartItems);
  sessionStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
}

async function loadCart() {
  const cartItems = getCartContents();
  if (cartItems.length === 0) {
    document.getElementById("cartModalBody").innerHTML = "Your cart is empty";
    document.getElementById("checkoutBtn").disabled = true;
    return;
  }
  document.getElementById("checkoutBtn").disabled = false;
  let totalAmount = 0;
  let content = `
      <table id="cartTable" class="table table-striped align-middle">
      <thead>
        <tr>
          <th scope="col" class="col-4">Product Name</th>
          <th scope="col" class="col-2">Quantity</th>
          <th scope="col" class="col-2 text-center">Unit Price</th>
          <th scope="col" class="col-3 text-center">Sub Total</th>
          <th scope="col" class="col-1"></th>
        </tr>
      </thead>
      <tbody id="cartTableBody">

      `;
  for (let i = 0; i < cartItems.length; i += 1) {
    totalAmount += cartItems[i].price * cartItems[i].quantity;
    content += `
        <tr class="cartRow">
          <td>${cartItems[i].name}</td>
          <td>
            <input
              type="number"
              class="form-control cartQty"
              value="${cartItems[i].quantity}"
              min="1"
            />
          </td>
          <td class="cartUnitPrice text-center"><strong>S$</strong>${
            cartItems[i].price
          }</td>
          <td class="cartSubTotal text-center"><strong>S$</strong>${(
            Math.round(cartItems[i].price * cartItems[i].quantity * 100) / 100
          ).toFixed(2)}</td>
          <td>
            <button type="button" class="btn btn-danger removeItemBtn" value="${
              cartItems[i].id
            }" onclick="removeFromCart(${
      cartItems[i].id
    }).then(() => {loadCart()})">Remove</button>
          </td>
        </tr>
      `;
  }
  content += `
        </tbody>
      </table>
      <p id="cartTotalPrice"><strong>Total Price</strong>: S$${(
        Math.round(totalAmount * 100) / 100
      ).toFixed(2)}</p>
    `;

  document.getElementById("cartModalBody").innerHTML = content;
}

document.getElementById("cartBtn").addEventListener("click", () => {
  loadCart().then(() => {
    const cartRows = document.querySelectorAll(".cartRow");
    cartRows.forEach((row) => {
      const input = row.querySelector(".cartQty");
      const unitPrice = row.querySelector(".cartUnitPrice");
      const subTotal = row.querySelector(".cartSubTotal");

      input.addEventListener("input", () => {
        if (input.value < 1) {
          input.value = 1;
        }
        const qtyInputs = document.getElementsByClassName(
          "form-control cartQty"
        );
        const editQtyArr = [];
        for (let i = 0; i < qtyInputs.length; i += 1) {
          editQtyArr.push(qtyInputs[i].value);
        }
        editCartQty(editQtyArr);

        subTotal.innerHTML = `
          <strong>S$</strong>${(
            Math.round(unitPrice.innerText.slice(2) * input.value * 100) / 100
          ).toFixed(2)}</td>
          `;
        let updateTotal = 0;
        document.querySelectorAll(".cartSubTotal").forEach((unitSubTotal) => {
          updateTotal += +unitSubTotal.innerText.slice(2);
        });
        document.getElementById("cartTotalPrice").innerHTML = `
          <strong>Total Price</strong>: S$${updateTotal.toFixed(2)}
          `;
      });
    });
  });

  shoppingCartModal.show();
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  const cartItems = getCartContents();
  if (!cartItems.length) {
    return;
  }

  fetch("/api/checkout/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cartItems }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.err_msg) {
        alert(data.err_msg);
      }
      if (data.url) {
        window.location.href = data.url;
      }
    })
    .catch((err) => {
      console.error("Error: ", err);
    });
});
