/* eslint-disable no-useless-constructor */
class NavbarCustomerComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <nav class="navbar navbar-expand-lg bg-dark p-3" data-bs-theme="dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">Dying shop</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          </ul>
          <button id="cartBtn" class="btn btn-outline-success mx-3" type="submit">
            View cart
          </button>
          <div class="btn-group dropstart">
          <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Profile
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Orders</a></li>
            <li><a class="dropdown-item" href="#">Settings</a></li>
            <li><hr class="dropdown-divider"></li>

            <li><a class="dropdown-item text-danger" href="#" onclick="document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';window.location.href = '/' ">Log out</a></li>
          </ul>
        </div>
        </div>
      </div>
    </nav>
    `;
  }
}

customElements.define("navbar-customer-component", NavbarCustomerComponent);
