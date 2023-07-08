const urlString = window.location.href;
const url = new URL(urlString);

const productId = url.searchParams.get("id");

if (!productId) {
  window.location.href = "/";
}

/*
  Example of cartItem data:
  {
    id: 1,
    name: "something",
    quantity: 1,
    price: 1200
  }
*/

async function addToCart(item) {
  const cartItems = getCartContents();
  const existingItem = cartItems.find((cartItem) => item.id === cartItem.id);

  if (existingItem) {
    cartItems.forEach((cartItem) => {
      if (cartItem.id === item.id) {
        cartItem.quantity += 1;
      }
    });
  } else {
    cartItems.push(item);
  }

  sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
}

fetch(`/api/product/${productId}`)
  .then((response) => response.json())
  .then((productData) => {
    const { product } = productData;
    if (!product) {
      window.location.href = "/";
    }

    const content = `
    <div class="row mt-3">
        <div class="col-1"></div>
        <div class="col-1">
          <a class="fs-5" href="/">Back</a>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-1"></div>
        <div class="col-4 p-0" style="overflow-x: scroll">
          <img id="productImage" style="height: 40.625em" src="${product.image_url}" />
        </div>
        <div class="col-6 px-4">
          <div>
            <h1 id="productHeader">${product.name}</h1>
            <h4 id="productPrice">S$${product.price}</h4>
          </div>
          <div class="mt-5 border-top">
            <h5 class="mt-3 fw-bold">Product Details</h5>
            <p id="productCategory">
              <span class="fw-bold">Category: </span>Loading...
            </p>
            <p id="productDesc" style="height: 14.52em; overflow: hidden">
              <span class="fw-bold">Description: </span>${product.description}
            </p>
            <p id="productStock">
              <span class="fw-bold">Stock: </span>${product.stock_qty}
            </p>
            <button id="addToCartBtn" class="btn">Add to cart</button>
            <p id="feedback" class="mt-3"></p>
          </div>
        </div>
        <div class="col-1"></div>
      </div>
    `;

    fetch(`/api/category/${product.category_id}`)
      .then((response) => response.json())
      .then((categoryData) => {
        const { category } = categoryData;
        document.getElementById("productCategory").innerHTML = `
        <span class="fw-bold">Category: </span>
        ${category.name}`;
      })
      .catch((err) => {
        throw err;
      });

    document.getElementById("content").innerHTML = content;

    if (product.stock_qty === 0) {
      document.getElementById("addToCartBtn").disabled = true;
      document.getElementById("addToCartBtn").innerHTML = "Out of stock";
      document.getElementById("addToCartBtn").classList = `btn btn-secondary`;
    } else {
      document.getElementById("addToCartBtn").disabled = false;
      document.getElementById("addToCartBtn").classList = `btn btn-primary`;
      document.getElementById("addToCartBtn").addEventListener("click", () => {
        addToCart({
          id: product.id,
          name: product.name,
          quantity: 1,
          price: product.price,
        }).then(() => {
          document.getElementById("feedback").innerHTML =
            "Product added to cart!";
        });
      });
    }
  })
  .catch((err) => {
    console.error("Error: ", err);
  });
