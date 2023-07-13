/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
document.getElementById("order-btn").className = `nav-link active`;
const orderModal = new bootstrap.Modal(document.getElementById("orderModal"));
const refundModal = new bootstrap.Modal(
  document.getElementById("confirmRefundModal")
);
const feedbackModal = new bootstrap.Modal(
  document.getElementById("feedbackModal")
);

// document.getElementById("refundBtn").addEventListener("click", () => {
//   orderModal.hide();
// });

const items = [];

function renderOrderModal(orderNum, refundStatus, paymentIntentId) {
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

  if (refundStatus) {
    document.getElementById("orderModalTitle").innerHTML = `Order #${
      orderNum + 1
    } Details <span class="badge text-bg-warning">Refunded</span>`;
    document.getElementById("refundBtn").disabled = true;
  } else {
    document.getElementById("orderModalTitle").innerHTML = `Order #${
      orderNum + 1
    } Details`;
    document.getElementById("refundBtn").addEventListener("click", () => {
      document
        .getElementById("confirmRefundBtn")
        .addEventListener("click", () => {
          document.getElementById("confirmRefundBtn").disabled = true;
          document.getElementById("confirmRefundCancelBtn").disabled = true;
          document.getElementById("confirmRefundTopCancelBtn").disabled = true;
          document.getElementById(
            "confirmRefundBtn"
          ).innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-lg" style="color: #ffffff;"></i>`;
          fetch("/api/admin/order/refund", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentIntentId }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.err_msg) {
                document.getElementById("feedbackModalContent").innerText =
                  data.err_msg;
              } else {
                document.getElementById("feedbackModalContent").innerText =
                  data.success;
              }
              refundModal.hide();
              document.getElementById("confirmRefundBtn").disabled = false;
              document.getElementById(
                "confirmRefundCancelBtn"
              ).disabled = false;
              document.getElementById(
                "confirmRefundTopCancelBtn"
              ).disabled = false;
              feedbackModal.show();
            })
            .catch((err) => {});
        });
      orderModal.hide();
      refundModal.show();
    });
    document.getElementById("refundBtn").disabled = false;
  }

  document.getElementById(
    "totalPrice"
  ).innerHTML = `<strong>Total Price: SGD</strong>${totalPrice.toFixed(2)}`;
  document.getElementById("modalOrderTable").innerHTML = tableContent;
  orderModal.show();
}

function loadOrderPage() {
  document.getElementById("content-div").innerHTML = `
  <div class="d-flex justify-content-center">
  <div
    class="spinner-border"
    style="width: 3.6rem; height: 3.6rem"
    role="status"
  >
    <span class="sr-only">Loading...</span>
  </div>
</div>
  `;
  fetch("/api/admin/order")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      let orderContent = `
      <h1 class="text-center text-bold"><strong>Customer</strong></h1>
      <table class="table table-striped table-bordered mt-3">
        <thead>
          <tr>
            <th scope="col" class="col-1">#</th>
            <th scope="col" class="col-4">Stripe payment ID</th>
            <th scope="col" class="col-2">No. of items</th>
            <th scope="col" class="col-2">Customer</th>
            <th scope="col" class="col-2">Created On</th>
            <th scope="col" class="col-1 text-center">View more</th>
          </tr>
        </thead>
        <tbody class="table-group-divider">
      `;

      const { orders } = data;
      let statusSpan = "";

      for (let i = 0; i < orders.length; i += 1) {
        const { stripe_id, checkout_items, created_at, refund } = orders[i];
        let { customer_id } = orders[i];
        if (customer_id === null) {
          customer_id = "Guest";
        }
        if (refund) {
          statusSpan = `<span class="badge text-bg-warning ms-2">Refunded</span>`;
        } else {
          statusSpan = `<span class="badge text-bg-success ms-2">Paid</span>`;
        }
        items.push(checkout_items);
        orderContent += `
          <tr>
            <th scope="row">${i + 1}</th>
            <td>${stripe_id}${statusSpan}</td>
            <td>${checkout_items.length}</td>
            <td>${customer_id}</td>
            <td>${new Date(created_at * 1000).toLocaleString()}</td>
            <td class="text-center">
              <button type="button" class="btn btn-primary" onclick="renderOrderModal(${i},${!!refund},'${stripe_id}')">
                View
              </button>
            </td>
          </tr>
        `;
      }
      orderContent += `</tbody></table>`;

      document.getElementById("content-div").innerHTML = orderContent;
    });
}

loadOrderPage();
