/* eslint-disable no-useless-constructor */
class NavbarComponent extends HTMLElement {
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
          <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>
          <button id="cartBtn" class="btn btn-outline-success" type="submit">
            View cart
          </button>
          <button
            id=""
            class="btn btn-outline-primary mx-3"
            type="submit"
            onclick="window.location.href='/signup'"
          >
            Sign up
          </button>
          <button
            id=""
            class="btn btn-outline-primary"
            type="submit"
            onclick="window.location.href='/login'"
          >
            Sign in
          </button>
        </div>
      </div>
    </nav>
    `;
  }
}

customElements.define("navbar-component", NavbarComponent);
