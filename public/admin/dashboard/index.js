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
  fetch("http://localhost:3000/api/category")
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
          fetch(`http://localhost:3000/api/category/${categoryId}`)
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

// logout button event listener for user to logout properly
document
  .getElementById("logout-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    fetch("http://localhost:3000/api/admin/logout", {
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

    dashboardUiBtnUpdate(document.getElementById("category-btn"));
    loadCategoryPage();
  });

document.getElementById("createCategoryBtn").addEventListener("click", () => {
  const categoryData = {
    name: document.getElementById("createCategoryNameInput").value,
    description: document.getElementById("createCategoryDescInput").value,
  };

  fetch("/api/category", {
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
});

// event listener for when the edit category modal's save changes button is clicked
document.getElementById("updateCategoryBtn").addEventListener("click", () => {
  const editData = {
    id: document.getElementById("editCategoryIdInput").placeholder,
    name: document.getElementById("editCategoryNameInput").value,
    description: document.getElementById("editCategoryDescInput").value,
  };

  fetch("http://localhost:3000/api/category", {
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
});

// event listener for when the edit modal's delete button is clicked
document.getElementById("deleteCategoryBtn").addEventListener("click", () => {
  hideModal(editModal);
  const id = document.getElementById("editCategoryIdInput").placeholder;
  // TODO: need do check if it is category or product etc.
  document.getElementById(
    "confirmDeleteModalContent"
  ).innerHTML = `You are <strong>DELETING category</strong> with <strong>ID ${id}</strong>`;
  showModal(deleteModal);
});

// event listener for when the confirm delete modal's `Yes, I'm sure` button is clicked
document
  .getElementById("confirmConfirmDeleteBtn")
  .addEventListener("click", () => {
    const id = document.getElementById("editCategoryIdInput").placeholder;
    fetch("/api/category", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
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
  });

// event listener for when the admin dashboard's product button is clicked
document
  .getElementById("product-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    dashboardUiBtnUpdate(document.getElementById("product-btn"));

    const contentDiv = document.getElementById("content-div");
    contentDiv.innerHTML = `
      <strong>
        Product
      </strong>
    `;
  });
