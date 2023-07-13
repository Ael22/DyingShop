/* eslint-disable no-useless-constructor */
class AdminComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <div class="row">
      <!-- Sidebar of admin dashboard -->
      <div
        class="sidebar d-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100 col-2 fixed-top"
      >
        <a
          href="/admin/dashboard"
          class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
        >
          <span class="fs-4">Admin Dashboard</span>
        </a>
        <hr />
        <ul class="nav nav-pills flex-column mb-auto">
          <li class="nav-item mb-1">
            <a
              href="/admin/dashboard/"
              class="nav-link text-white"
              aria-current="page"
              id="home-btn"
            >
              Home
            </a>
          </li>
          <li class="nav-item mb-1">
            <a href="/admin/dashboard/categories" class="nav-link text-white" id="category-btn">
              Categories
            </a>
          </li>
          <li class="nav-item mb-1">
            <a href="/admin/dashboard/products" class="nav-link text-white" id="product-btn">
              Products
            </a>
          </li>
          <li class="nav-item mb-1">
            <a href="/admin/dashboard/customers" class="nav-link text-white" id="customer-btn">
              Customers
            </a>
          </li>
          <li class="nav-item mb-1">
            <a href="/admin/dashboard/transaction" class="nav-link text-white" id="transaction-btn">
              Transactions
            </a>
          </li>
        </ul>
        <hr />
        <div class="nav-pills">
          <a class="nav-link text-white py-2 ps-3" href="#" id="logout-btn"
            >Sign out</a
          >
        </div>
      </div>
      <!-- gap in collumn so content is shown properly -->
      <div class="col-2"></div>

      <!-- main content div where information is displayed to the admin -->
      <div class="container p-5 col-10 vh-200" id="content-div"></div>
    </div>
    `;
  }
}

customElements.define("navbar-admin-component", AdminComponent);
