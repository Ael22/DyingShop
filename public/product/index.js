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
    document.getElementById("productHeader").innerText = product.name;
    document.getElementById("productPrice").innerText = `S$${product.price}`;
    document.getElementById("productImage").src = `..${product.image_url}`;
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

    fetch(`/api/category/${product.category_id}`)
      .then((response) => response.json())
      .then((categoryData) => {
        const { category } = categoryData;
        document.getElementById(
          "productCategory"
        ).innerHTML += `${category.name}`;
      })
      .catch((err) => {
        throw err;
      });
  })
  .catch((err) => {
    console.error("Error: ", err);
  });
