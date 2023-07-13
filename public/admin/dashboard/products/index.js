/* eslint-disable camelcase */
document.getElementById("product-btn").className = `nav-link active`;

let selectedFile = "";
let formData = new FormData();

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
 * Renders the product forms category dropdown
 * @param {*} selectMenuId
 */
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
              <th scope="col" class="col-4">Description</th>
              <th scope="col" class="col-1">Image</th>
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
        <td><i class="fa-solid fa-check" style="color: #0f0f0f;"></i></td>
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
    })
    .catch((err) => {
      console.error(err);
    });
}

function loadConfirmDeleteCategoryAlert() {
  const productId = document.getElementById("editProductIdInput").placeholder;

  if (productId) {
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

const fileInput = document.getElementById("editProductFileInput");
fileInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];
  formData = new FormData();
  formData.append("file", selectedFile);
});

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
    .then((response) => {
      document.getElementById(
        "feedbackModalContent"
      ).innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-lg" style="color: #000000;"></i>`;
      return response.json();
    })
    .then((data) => {
      if (data.success_msg) {
        if (!selectedFile) {
          document.getElementById(
            "feedbackModalContent"
          ).innerText = `${data.success_msg}`;
          return;
        }

        fetch(
          `/api/admin/product/${parseInt(
            document.getElementById("editProductIdInput").placeholder,
            10
          )}/upload`,
          {
            method: "PUT",
            body: formData,
          }
        )
          .then((response) => response.json())
          .then((imageData) => {
            if (imageData.error) {
              throw new Error(
                `${data.success_msg}\nbut image upload failed due to ${imageData.error}`
              );
            }
            document.getElementById(
              "feedbackModalContent"
            ).innerText = `${data.success_msg}\n${imageData.success_msg}`;
          })
          .catch((err) => {
            document.getElementById("feedbackModalContent").innerText =
              err.message;
          });
      } else {
        document.getElementById("feedbackModalContent").innerText =
          data.err_msg;
      }
    })
    .then(() => {
      hideModal(editProductModal);
      showModal(feedbackModal);
      loadProductPage();
    })
    .catch((err) => {
      console.error("Error ", err);
    })
    .finally(() => {
      formData = new FormData();
      document.getElementById("editProductFileInput").value = "";
      selectedFile = "";
    });
}

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

document
  .getElementById("confirmConfirmDeleteBtn")
  .addEventListener("click", () => {
    loadConfirmDeleteCategoryAlert();
  });

renderProductFormCategoryMenu("editProductCatgorySelectMenu");
renderProductFormCategoryMenu("createProductCategorySelectMenu");
loadProductPage();
