async function loadCategoryDropdown() {
  fetch("/api/category")
    .then((response) => response.json())
    .then((data) => {
      const { categories } = data;
      let categoryDropdownHTML = "";
      for (let i = 0; i < categories.length; i += 1) {
        categoryDropdownHTML += `
      <li><a class="dropdown-item" href="#">${categories[i].name}</a></li>
      `;
        if (i < categories.length - 1) {
          categoryDropdownHTML += `
        <li><hr class="dropdown-divider" /></li>
        `;
        }
      }
      document.getElementById("categoryDropdown").innerHTML =
        categoryDropdownHTML;
    })
    .catch((err) => {
      console.log(err);
    });
}

// TODO: fill up page with all products
async function loadProducts() {
  fetch("/api/product")
    .then((response) => response.json())
    .then((data) => {
      const { products } = data;
      console.log(products);
    })
    .catch((err) => {
      console.log(err);
    });
}
function loadSiteResources() {
  Promise.all([loadProducts(), loadCategoryDropdown()])
    .then(() => {
      console.log("Loading complete");
    })
    .catch((err) => {
      console.error("Error ", err);
    });
}

loadSiteResources();
