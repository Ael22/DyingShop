/* eslint-disable camelcase */

// Checks if user's token is valid
fetch("/admin/verify", {
  method: "POST",
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({}),
});

/**
 *  updates the admin dashboard links
 * @param {[HTMLElement]} element The element link button that needs to be update
 */
function dashboardUiBtnUpdate(element) {
  const elementArr = [
    document.getElementById("home-btn"),
    document.getElementById("category-btn"),
    document.getElementById("product-btn"),
    document.getElementById("customer-btn"),
  ];

  for (let i = 0; i < elementArr.length; i += 1) {
    if (elementArr[i] !== element) {
      elementArr[i].className = `
      nav-link text-white
      `;
    } else {
      elementArr[i].className = `
      nav-link active
      `;
    }
  }
}

function renderProductFormCategoryMenu(selectMenuId) {
  fetch("/api/category")
    .then((response) => response.json())
    .then((data) => {
      const { categories } = data;
      const formSelectMenu = document.getElementById(selectMenuId);
      for (let i = 0; i < categories.length; i += 1) {
        const option = document.createElement("option");
        option.text = categories[i].name;
        option.value = categories[i].id;
        formSelectMenu.add(option);
      }
    });
}

renderProductFormCategoryMenu("editProductCatgorySelectMenu");
renderProductFormCategoryMenu("createProductCategorySelectMenu");

// Modal for createing new category
const createCategoryModal = new bootstrap.Modal(
  document.getElementById("createCategoryModal")
);

// modal for editing category
const editModal = new bootstrap.Modal(
  document.getElementById("editCategoryModal")
);

// modal for backend/database response
const feedbackModal = new bootstrap.Modal(
  document.getElementById("feedbackModal")
);

// modal for modal deletion
const deleteModal = new bootstrap.Modal(
  document.getElementById("confirmDeleteModal")
);

const createProductModal = new bootstrap.Modal(
  document.getElementById("createProductModal")
);

const editProductModal = new bootstrap.Modal(
  document.getElementById("editProductModal")
);

/**
 * Shows the modal that the admin needs to see
 * @param {*} modal The modal that you want to show
 */

function showModal(modal) {
  modal.show();
}

/**
 * Hides the modal that the admin is seeing
 * @param {*} modal The modal that you want to hide
 */
function hideModal(modal) {
  modal.hide();
}

/**
 * loads/reloads the category page
 */
function loadCategoryPage() {
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
  fetch("/api/category")
    .then((response) => response.json())
    .then((data) => {
      let categoryContent = `
      <h1 class="text-center text-bold"><strong>Category</strong></h1>
      <button type="button" class="btn btn-primary" id="createCategoryBtn">Create New Category</button>
      <table  class="table table-striped table-bordered mt-3">
        <thead>
          <tr>
            <th scope="col" class="col-1">ID</th>
            <th scope="col" class="col-2">Name</th>
            <th scope="col" class="col-7">Description</th>
            <th scope="col" class="col-2 text-center">Edit Category</th>
          </tr>
        </thead>
        <tbody class="table-group-divider">
  
  
      `;
      const { categories } = data;
      categories.forEach((category) => {
        const { id, name, description } = category;
        categoryContent += `
        <tr>
        <th scope="row">${id}</th>
        <td>${name}</td>
        <td>${description}</td>
        <td class="text-center">
        <button type="button" class="btn btn-primary editCategoryBtn" id="editCategoryBtn${id}">
          Edit
        </button>
        </td>
      </tr>
        `;
      });
      return categoryContent;
    })
    .then((table) => {
      table += `
      </tbody>
    </table>
    `;
      const contentDiv = document.getElementById("content-div");
      contentDiv.innerHTML = table;

      document
        .getElementById("createCategoryBtn")
        .addEventListener("click", () => {
          document.getElementById("createCategoryNameInput").value = "";
          document.getElementById("createCategoryDescInput").value = "";
          showModal(createCategoryModal);
        });
      const editCategoryButtons = document.getElementsByClassName(
        "btn btn-primary editCategoryBtn"
      );
      for (let i = 0; i < editCategoryButtons.length; i += 1) {
        editCategoryButtons[i].addEventListener("click", () => {
          const categoryId = editCategoryButtons[i].id.replace(/[^\d.]/g, "");
          fetch(`/api/category/${categoryId}`)
            .then((response) => response.json())
            .then((data) => {
              const { category } = data;
              document.getElementById("editCategoryIdInput").placeholder =
                category.id;
              document.getElementById("editCategoryNameInput").value =
                category.name;
              document.getElementById("editCategoryDescInput").value =
                category.description;
              showModal(editModal);
            })
            .catch((err) => {
              console.error("Error: ", err);
            });
        });
      }
    })
    .catch((err) => {
      console.error("Error: ", err);
    });
}

function submitCategoryCreateForm() {
  const categoryData = {
    name: document.getElementById("createCategoryNameInput").value,
    description: document.getElementById("createCategoryDescInput").value,
  };

  fetch("/api/admin/category", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoryData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      hideModal(createCategoryModal);
      if (data.success_msg) {
        document.getElementById("feedbackModalContent").innerText =
          data.success_msg;
      } else {
        document.getElementById("feedbackModalContent").innerText =
          data.err_msg;
      }
      showModal(feedbackModal);
      loadCategoryPage();
    });
}

function submitCategoryUpdateForm() {
  const editData = {
    id: document.getElementById("editCategoryIdInput").placeholder,
    name: document.getElementById("editCategoryNameInput").value,
    description: document.getElementById("editCategoryDescInput").value,
  };

  fetch("/api/admin/category", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editData),
  })
    .then((response) => response.json())
    .then((data) => {
      hideModal(editModal);
      if (data.success_msg) {
        document.getElementById("feedbackModalContent").innerText =
          data.success_msg;
      } else {
        document.getElementById("feedbackModalContent").innerText =
          data.err_msg;
      }
      showModal(feedbackModal);
      loadCategoryPage();
    });
}

function clearEditCategoryForm() {
  document.getElementById("editCategoryIdInput").placeholder = "";
  document.getElementById("editCategoryNameInput").value = "";
  document.getElementById("editCategoryDescInput").value = "";
}

function clearEditProductForm() {
  document.getElementById("editProductIdInput").placeholder = "";
  document.getElementById("editProductNameInput").value = "";
  document.getElementById("editProductPriceInput").value = "";
  document.getElementById("editProductStockInput").value = "";
  document.getElementById("editProductCatgorySelectMenu").value = "";
  document.getElementById("editProductDescInput").value = "";
}

function loadProductPage() {
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
  fetch("/api/product")
    .then((response) => response.json())
    .then((data) => {
      let productContent = `
  <h1 class="text-center text-bold"><strong>Product</strong></h1>
        <button type="button" class="btn btn-primary" id="createProductBtn">
          Create New Product
        </button>
        <table class="table table-striped table-bordered mt-3">
          <thead>
            <tr>
              <th scope="col" class="col-1">ID</th>
              <th scope="col" class="col-2">Name</th>
              <th scope="col">Description</th>
              <th scope="col" class="col-1">Price</th>
              <th scope="col" class="col-1">Stock Quantity</th>
              <th scope="col" class="col-1">Category Id</th>
              <th scope="col" class="col-1 text-center">Edit Product</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
  `;
      const { products } = data;
      products.forEach((product) => {
        const { id, name, description, price, stock_qty, category_id } =
          product;
        productContent += `
        <tr>
        <th scope="row">${id}</th>
        <td>${name}</td>
        <td>${description}</td>
        <td>$${price}</td>
        <td>${stock_qty}</td>
        <td>${category_id}</td>
        <td class="text-center">
          <button type="button" class="btn btn-primary editProductBtn" id="editProductBtn${id}">
            Edit
          </button>
        </td>
      </tr>
        `;
      });
      return productContent;
    })
    .then((table) => {
      table += `
      </tbody>
      </table>
      `;

      const contentDiv = document.getElementById("content-div");
      contentDiv.innerHTML = table;

      document
        .getElementById("createProductBtn")
        .addEventListener("click", () => {
          document.getElementById("createProductNameInput").value = "";
          document.getElementById("createProductPriceInput").value = "";
          document.getElementById("createProductStockInput").value = "";
          document.getElementById("createProductDescInput").value = "";
          showModal(createProductModal);
        });

      const editProductButtons = document.getElementsByClassName(
        "btn btn-primary editProductBtn"
      );

      for (let i = 0; i < editProductButtons.length; i += 1) {
        editProductButtons[i].addEventListener("click", () => {
          const productId = editProductButtons[i].id.replace(/[^\d.]/g, "");
          fetch(`/api/product/${productId}`)
            .then((response) => response.json())
            .then((data) => {
              const { product } = data;
              document.getElementById("editProductIdInput").placeholder =
                product.id;
              document.getElementById("editProductNameInput").value =
                product.name;
              document.getElementById("editProductPriceInput").value =
                product.price;
              document.getElementById("editProductStockInput").value =
                product.stock_qty;
              document.getElementById("editProductDescInput").value =
                product.description;
              document.getElementById("editProductCatgorySelectMenu").value =
                product.category_id;
            });

          showModal(editProductModal);
        });
      }
    })
    .catch((err) => {
      console.error("Error: ", err);
    });
}

function submitProductCreateForm() {
  const productData = {
    name: document.getElementById("createProductNameInput").value,
    description: document.getElementById("createProductDescInput").value,
    price: document.getElementById("createProductPriceInput").value,
    stockQty: document.getElementById("createProductStockInput").value,
    categoryId: document.getElementById("createProductCategorySelectMenu")
      .value,
  };

  fetch("/api/admin/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      hideModal(createProductModal);
      if (data.success_msg) {
        document.getElementById("feedbackModalContent").innerText =
          data.success_msg;
      } else {
        document.getElementById("feedbackModalContent").innerText =
          data.err_msg;
      }
      showModal(feedbackModal);
      loadProductPage();
    });
}

function submitProductUpdateForm() {
  const editData = {
    id: parseInt(document.getElementById("editProductIdInput").placeholder, 10),
    name: document.getElementById("editProductNameInput").value,
    description: document.getElementById("editProductDescInput").value,
    price: document.getElementById("editProductPriceInput").value,
    stockQty: parseInt(
      document.getElementById("editProductStockInput").value,
      10
    ),
    categoryId: parseInt(
      document.getElementById("editProductCatgorySelectMenu").value,
      10
    ),
  };

  fetch("/api/admin/product", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editData),
  })
    .then((response) => response.json())
    .then((data) => {
      hideModal(editProductModal);
      if (data.success_msg) {
        document.getElementById("feedbackModalContent").innerText =
          data.success_msg;
      } else {
        document.getElementById("feedbackModalContent").innerText =
          data.err_msg;
      }
      showModal(feedbackModal);
      loadProductPage();
    });
}

function loadConfirmDeleteCategoryAlert() {
  const categoryId = document.getElementById("editCategoryIdInput").placeholder;
  const productId = document.getElementById("editProductIdInput").placeholder;
  if (!productId) {
    fetch("/api/admin/category", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: categoryId }),
    })
      .then((response) => {
        hideModal(deleteModal);
        if (response.ok) {
          document.getElementById("feedbackModalContent").innerText =
            "Deletion Success";
          showModal(feedbackModal);
        } else {
          document.getElementById("feedbackModalContent").innerText =
            "Deletion Failed";
          showModal(feedbackModal);
        }
        loadCategoryPage();
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  } else if (!categoryId) {
    fetch("/api/admin/product", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: productId }),
    })
      .then((response) => {
        hideModal(deleteModal);
        if (response.ok) {
          document.getElementById("feedbackModalContent").innerText =
            "Deletion Success";
          showModal(feedbackModal);
        } else {
          document.getElementById("feedbackModalContent").innerText =
            "Deletion Failed";
          showModal(feedbackModal);
        }
        loadProductPage();
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  }
}

// logout button event listener for user to logout properly
document
  .getElementById("logout-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    fetch("/api/admin/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        const { status } = response;
        if (status === 200) {
          window.location.href = "http://localhost:3000";
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  });

// event listener for when the admin dashboard's home button is clicked
document.getElementById("home-btn").addEventListener("click", function (event) {
  event.preventDefault();

  dashboardUiBtnUpdate(document.getElementById("home-btn"));

  const contentDiv = document.getElementById("content-div");
  contentDiv.innerHTML = `
    <strong>
      HOME
    </strong>
  `;
});

// event listener for when the admin dashboard's category button is clicked
document
  .getElementById("category-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    clearEditProductForm();
    dashboardUiBtnUpdate(document.getElementById("category-btn"));
    loadCategoryPage();
  });

// event listener for when the admin dashboard's create category button is clicked
document
  .getElementById("createCategoryFormBtn")
  .addEventListener("click", () => {
    submitCategoryCreateForm();
  });

// event listener for when the edit category modal's save changes button is clicked
document.getElementById("updateCategoryBtn").addEventListener("click", () => {
  submitCategoryUpdateForm();
});

// event listener for when the edit modal's delete button is clicked
document.getElementById("deleteCategoryBtn").addEventListener("click", () => {
  hideModal(editModal);
  const id = document.getElementById("editCategoryIdInput").placeholder;
  document.getElementById(
    "confirmDeleteModalContent"
  ).innerHTML = `You are <strong>DELETING category</strong> with <strong>ID ${id}</strong>`;
  showModal(deleteModal);
});

// event listener for when the confirm delete modal's `Yes, I'm sure` button is clicked
document
  .getElementById("confirmConfirmDeleteBtn")
  .addEventListener("click", () => {
    loadConfirmDeleteCategoryAlert();
  });

// event listener for when the admin dashboard's product button is clicked
document
  .getElementById("product-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    clearEditCategoryForm();
    dashboardUiBtnUpdate(document.getElementById("product-btn"));
    loadProductPage();
  });

document.getElementById("updateProductBtn").addEventListener("click", () => {
  submitProductUpdateForm();
});

document.getElementById("deleteProductBtn").addEventListener("click", () => {
  hideModal(editProductModal);
  const id = document.getElementById("editProductIdInput").placeholder;
  document.getElementById(
    "confirmDeleteModalContent"
  ).innerHTML = `You are <strong>DELETING Product</strong> with <strong>ID ${id}</strong>`;
  showModal(deleteModal);
});

document
  .getElementById("createProductFormBtn")
  .addEventListener("click", () => {
    submitProductCreateForm();
  });
