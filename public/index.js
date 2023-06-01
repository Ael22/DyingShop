/**
 * Function that loads the category side menu
 * @param {JSON} data JSON data of categories
 */
async function loadCategoryDropdown(data) {
  const { categories } = data;
  if (!categories) {
    document.getElementById("categoryList").innerHTML =
      "Categories cannot be loaded";
    return;
  }
  let categoryHTML = "";
  categories.forEach((category) => {
    categoryHTML += `
        <a href="#">
          <li class="list-group-item">
            ${category.name}
          </li>
        </a>
        `;
  });
  document.getElementById("categoryList").innerHTML = categoryHTML;
}

/**
 * Function that loads the home page with cards of products
 * @param {JSON} data JSON data of products
 */
async function loadProducts(data) {
  const { products } = data;
  if (!products) {
    document.getElementById("productListing").innerHTML =
      "Products cannot be loaded";
    return;
  }
  let productHTML = "";
  products.forEach((product) => {
    let footerText = `
          <small class="fw-bold">${product.stock_qty} left</small>
        `;
    if (product.stock_qty < 1) {
      footerText = `
          <small class="fw-bold text-danger">Out of Stock</small>
          `;
    }
    productHTML += `
            <div class="col-4 mt-3">
            <a class="default-cursor" href="/product?id=${product.id}">
              <div class="card clickable" style="width: 20rem">
                <img src="${product.image_url}" class="card-img-top" alt="..." />
                <div class="card-body">
                  <p class="card-title">${product.name}</p>
                  <h5 class="card-text">
                    S$${product.price}
                  </h5>
                </div>
                <div class="card-footer">
                ${footerText}
                </div>
              </div>
            </a>
            </div>
        `;
  });

  document.getElementById("productListing").innerHTML = productHTML;
}

/**
 * Function that fetches required data and render the whole page
 */
async function renderSite() {
  try {
    const data = await Promise.all([
      fetch("/api/category").then((response) => response.json()),
      fetch("/api/product").then((response) => response.json()),
    ]);
    Promise.all([loadCategoryDropdown(data[0]), loadProducts(data[1])]);
  } catch (err) {
    console.log(err);
  }
}

renderSite();
