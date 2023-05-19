const urlString = window.location.href;
const url = new URL(urlString);

const productId = url.searchParams.get("id");

if (!productId) {
  // TODO: send redirect
}

fetch(`/api/product/${productId}`)
  .then((response) => response.json())
  .then((productData) => {
    const { product } = productData;
    document.getElementById("productHeader").innerText = product.name;
    document.getElementById("productPrice").innerText = `S$${product.price}`;
    document.getElementById("productImage").src = `.${product.image_url}`;
    document.getElementById(
      "productDesc"
    ).innerHTML += `${product.description}`;
    document.getElementById("productStock").innerHTML += `${product.stock_qty}`;

    if (product.stock_qty === 0) {
      document.getElementById("addToCartBtn").disabled = true;
      document.getElementById("addToCartBtn").innerHTML = "Out of stock";
      document.getElementById("addToCartBtn").classList = `btn btn-secondary`;
    } else {
      document.getElementById("addToCartBtn").disabled = false;
      document.getElementById("addToCartBtn").classList = `btn btn-primary`;
    }

    fetch(`/api/category/${product.category_id}`)
      .then((response) => response.json())
      .then((categoryData) => {
        const { category } = categoryData;
        document.getElementById(
          "productCategory"
        ).innerHTML += `${category.name}`;
      });
  });
