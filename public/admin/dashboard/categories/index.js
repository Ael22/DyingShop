document.getElementById("category-btn").className = `nav-link active`;

const createCategoryModal = new bootstrap.Modal(
  document.getElementById("createCategoryModal")
);

const editModal = new bootstrap.Modal(
  document.getElementById("editCategoryModal")
);

const feedbackModal = new bootstrap.Modal(
  document.getElementById("feedbackModal")
);

const deleteModal = new bootstrap.Modal(
  document.getElementById("confirmDeleteModal")
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
            <th scope="col" class="col-6">Description</th>
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

function loadConfirmDeleteCategoryAlert() {
  const categoryId = document.getElementById("editCategoryIdInput").placeholder;
  if (categoryId) {
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

loadCategoryPage();
