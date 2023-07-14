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


  
      <div class="chart-container" style="position: relative; height:40vh; width:60vw">
        <canvas id="myChart"></canvas>
      </div>
    
  
  `;

  const ctx = document.getElementById("myChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
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
}

loadPage();
