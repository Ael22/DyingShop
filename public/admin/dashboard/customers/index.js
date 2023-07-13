/* eslint-disable camelcase */
// Customers code
function loadCustomerPage() {
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

  fetch("/api/admin/customer")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      let customerContent = `
      <h1 class="text-center text-bold"><strong>Customer</strong></h1>
      <table class="table table-striped table-bordered mt-3">
        <thead>
          <tr>
            <th scope="col" class="col-1">ID</th>
            <th scope="col" class="col-2">First Name</th>
            <th scope="col" class="col-2">Last Name</th>
            <th scope="col" class="col-5">Email</th>
            <th scope="col" class="col-2">Created On</th>
          </tr>
        </thead>
        <tbody class="table-group-divider">`;
      const { customers } = data;
      customers.forEach((customer) => {
        console.log(customer);
        const { id, first_name, last_name, email, created_at } = customer;
        customerContent += `
        <tr>
        <th scope="row">${id}</th>
        <td>${first_name}</td>
        <td>${last_name}</td>
        <td>${email}</td>
        <td>${new Date(created_at).toLocaleString()}</td>
      </tr>
        `;
      });

      document.getElementById("content-div").innerHTML = customerContent;
    });
}

document.getElementById("customer-btn").className = `nav-link active`;

loadCustomerPage();
