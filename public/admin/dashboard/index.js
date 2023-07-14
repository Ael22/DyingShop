/* eslint-disable no-new */
function loadPage() {
  document.getElementById("content-div").innerHTML = `
  <div class="row">
    <div class="col p-2">
      <div class="card">
        <div class="card-body">
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
        <div class="card-body">
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
        <div class="card-body">
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
        <div class="card-body">
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


  
    <div class="chart-container">
      <canvas id="myChart"></canvas>
    </div>
    
  
  `;

  const ctx = document.getElementById("myChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [
        {
          label: "My First Dataset",
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  window.addEventListener("beforeprint", () => {
    ctx.resize(600, 600);
  });
  window.addEventListener("afterprint", () => {
    ctx.resize();
  });
}

loadPage();
