const orderModal = new bootstrap.Modal(document.getElementById("orderModal"));
const items = [];

document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  orderModal.hide();
});

// eslint-disable-next-line no-unused-vars
function renderOrderModal(orderNum) {
  const order = items[orderNum];
  let tableContent = "";
  let totalPrice = 0;

  for (let i = 0; i < order.length; i += 1) {
    tableContent += `
      <tr>
        <th scope="row">${i + 1}</td>
        <td class="clickable" onclick="window.open('${
          window.location.origin
        }/product?id=${order[i].id}', '_blank')">${order[i].name}</td>
        <td>${order[i].quantity}</td>
        <td>SGD${order[i].price}</td>
        <td class="text-end">SGD${(order[i].price * order[i].quantity).toFixed(
          2
        )}</td>
      </tr>
    `;
    totalPrice += order[i].price * order[i].quantity;
  }

  document.getElementById(
    "totalPrice"
  ).innerHTML = `<strong>Total Price: SGD</strong>${totalPrice.toFixed(2)}`;
  document.getElementById("modalOrderTable").innerHTML = tableContent;
  orderModal.show();
}

fetch("/api/user/orders", { method: "GET", credentials: "include" })
  .then((response) => response.json())
  .then((data) => {
    const { orders } = data;
    console.log(orders);

    if (orders.length < 1) {
      document.getElementById("mainDiv").innerHTML =
        "Such empty. Looks like you have to yet to place any orders :(";
      return;
    }

    let tableContent = "";

    for (let i = 0; i < orders.length; i += 1) {
      let moreItems = "";
      let cc = "";
      let refund = "";
      items.push(orders[i].items);
      if (orders[i].items.length > 1) {
        moreItems = `<p style="font-size: .7em">+ ${orders[i].items.length} items</p>`;
      }
      if (
        orders[i].payment_method === "visa" ||
        orders[i].payment_method === "mastercard"
      ) {
        cc = `<i class="fa-brands fa-cc-${orders[i].payment_method} fa-2xl"></i>`;
      } else {
        cc = orders[i].payment_method;
      }
      if (orders[i].refund) {
        refund = `<span class="badge text-bg-warning ms-3">Refunded</span>`;
      }
      tableContent += `
        <tr class="clickable" onclick="renderOrderModal(${i})">
          <th scope="row">${i + 1}</th>
          <td class="fs-5">
            <p class="h5">
            ${orders[i].items[0].name}${refund}
            </p>
            ${moreItems}
          </td>
          <td class="text-center">${cc}</td>
          <td><strong>${orders[i].currency.toUpperCase()}</strong>${
        orders[i].payment_amount
      }</td>
      <td>${new Date(orders[i].date).toLocaleString()}</td>

        </tr>
      `;
    }
    const style = document.createElement("style");
    style.innerHTML = `
      .clickable{
        cursor: pointer
      }
    `;
    document.head.appendChild(style);
    document.getElementById("ordersTableBody").innerHTML = tableContent;
  })
  .catch((error) => {
    console.log(error);
  });
