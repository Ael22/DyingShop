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

const editModal = new bootstrap.Modal(
  document.getElementById("editCategoryModal")
);

function showModal() {
  editModal.show();
}

function hideModal() {
  editModal.hide();
}

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

document
  .getElementById("category-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    dashboardUiBtnUpdate(document.getElementById("category-btn"));

    fetch("http://localhost:3000/api/category")
      .then((response) => response.json())
      .then((data) => {
        let categoryContent = `
        <h1 class="text-center text-bold"><strong>Category</strong></h1>
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
        const categories = data.categories;
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

        const editCategoryButtons = document.getElementsByClassName(
          "btn btn-primary editCategoryBtn"
        );
        for (let i = 0; i < editCategoryButtons.length; i += 1) {
          editCategoryButtons[i].addEventListener("click", () => {
            const categoryId = editCategoryButtons[i].id.slice("-1");
            fetch(`http://localhost:3000/api/category/${categoryId}`)
              .then((response) => response.json())
              .then((data) => {
                const category = data.category;
                document.getElementById("editCategoryIdInput").placeholder =
                  category.id;
                document.getElementById("editCategoryNameInput").value =
                  category.name;
                document.getElementById("editCategoryDescInput").value =
                  category.description;
                showModal();
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
  });

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
      hideModal();
      console.log(data);
    });
});

// const editCategoryButtons = document.getElementsByClassName(
//   "btn btn-primary editCategoryBtn"
// );
// for (let i = 0; i < editCategoryButtons.length; i += 1) {
//   editCategoryButtons[i].addEventListener("click", () => {
//     const categoryId = editCategoryButtons[i].id.slice("-1");
//     fetch(`http://localhost:3000/api/category/${categoryId}`)
//       .then((response) => {
//         response.json();
//       })
//       .then((data) => {
//         console.log(data);
//       });
//   });
// }

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
