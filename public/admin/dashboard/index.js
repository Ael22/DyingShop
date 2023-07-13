/* eslint-disable camelcase */
function loadDashboardHome() {
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

  fetch("/api/admin/product/payment")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const homeContent = `
        <h1>Total Sales: SGD${data.Total_Sales}</h1>
        <h2>Average Sale: SGD${(
          data.Total_Sales / data.Number_of_Sales
        ).toFixed(2)}</h2>
        <p>Popular products: 🚧🚧🚧</p>
        <p>Chart.js feafute for ReactJS + chartJS</p>
      `;

      document.getElementById("content-div").innerHTML = homeContent;
    });
}

loadDashboardHome();
