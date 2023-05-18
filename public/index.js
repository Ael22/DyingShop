async function loadCategoryDropdown() {
  fetch("/api/category")
    .then((response) => response.json())
    .then((data) => {
      const { categories } = data;
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
    })
    .catch((err) => {
      console.log(err);
    });
}

async function loadProducts() {
  fetch("/api/product")
    .then((response) => response.json())
    .then((data) => {
      const { products } = data;
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
