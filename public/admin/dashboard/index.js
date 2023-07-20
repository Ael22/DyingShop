/* eslint-disable no-new */
let dashboardChart;

function loadData() {
  const urls = [
    "/api/admin/statistic/totalsale",
    "/api/admin/statistic/popular",
    "/api/admin/statistic/graph",
  ];
  const promises = urls.map((url) =>
    fetch(url).then((response) => response.json())
  );

  Promise.all(promises)
    .then((data) => {
      const saleData = data[0];
      const popularData = data[1];
      const graphData = data[2];

      document.getElementById(
        "totalSale"
      ).innerHTML = `<h4>Net Volume:</h4><h5>SGD${saleData.net_volume}</h5>`;
      document.getElementById(
        "numSale"
      ).innerHTML = `<h4>Number of sales:</h4><h5>${saleData.number_of_sales}</h5>`;
      document.getElementById(
        "popularProduct"
      ).innerHTML = `<h4>Most Popular Product:</h4><h5>Product ID: ${popularData.most_popular_product.id} <small class="ms-3">sold ${popularData.most_popular_product.sold}</small></h5>`;
      document.getElementById(
        "popularCategory"
      ).innerHTML = `<h4>Most Popular Category:</h4><h5>Category ID: ${popularData.most_popular_category.category_id} <small class="ms-3">sold ${popularData.most_popular_category.sold}</small></h5>`;
      dashboardChart.options.plugins.title.text = "Net Volume over Months";
      dashboardChart.data.labels = graphData.graph_months;
      dashboardChart.data.datasets[0].data = graphData.graph_data;

      dashboardChart.update();
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("alert-container").className =
        "alert alert-danger";
      document.getElementById("alert-container").role = "alert";
      document.getElementById(
        "alert-container"
      ).innerHTML = `An error occured while fetching the data`;
    });
}

function loadPage() {
  document.getElementById("home-btn").className = `nav-link active`;
  document.getElementById("content-div").innerHTML = `
  <div class="row">
  <div id="alert-container">
  </div>
    <div class="col p-2">
      <div class="card">
        <div id="totalSale" class="card-body">
          <h4 class="card-title placeholder-glow">
            <span class="placeholder col-6"></span>
          </h4>
          <h5 class="card-title placeholder-glow">
            <span class="placeholder col-12"></span>
          </h5>
        </div>
      </div>
    </div>

    <div class="col p-2">
      <div class="card">
        <div id="numSale" class="card-body">
        <h4 class="card-title placeholder-glow">
          <span class="placeholder col-6"></span>
        </h4>
        <h5 class="card-title placeholder-glow">
          <span class="placeholder col-12"></span>
        </h5>
        </div>
      </div>
    </div>

    <div class="col p-2">
      <div class="card">
        <div id="popularProduct" class="card-body">
        <h4 class="card-title placeholder-glow">
          <span class="placeholder col-6"></span>
        </h4>
        <h5 class="card-title placeholder-glow">
          <span class="placeholder col-12"></span>
        </h5>
        </div>
      </div>
    </div>

    <div class="col p-2">
      <div class="card">
        <div id="popularCategory" class="card-body">
        <h4 class="card-title placeholder-glow">
          <span class="placeholder col-6"></span>
        </h4>
        <h5 class="card-title placeholder-glow">
          <span class="placeholder col-12"></span>
        </h5>
        </div>
      </div>
    </div>
  </div>


  
    <div class="chart-container" style="position: relative; height:70vh; width:80vw">
      <canvas id="myChart"></canvas>
    </div>
    
  
  `;

  const ctx = document.getElementById("myChart");
  ctx.style.backgroundColor = "#dee2e6";
  dashboardChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [
        {
          label: "Net Volume",
          data: [0, 0, 0, 0, 0, 0, 0],
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 3,
          tension: 0,
        },
      ],
    },
    options: {
      layout: {
        padding: 30,
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        title: {
          fullSize: true,
          display: true,
          text: "Loading...",
          font: {
            size: 30,
          },
        },
      },
    },
  });
  loadData();
}

loadPage();
