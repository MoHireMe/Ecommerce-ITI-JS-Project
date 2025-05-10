import {
  getAllProductsBySellerId,
  deleteProductById,
  updateProductById,
  addNewProduct,
} from "../api.js";

import { getCurrentUser } from "../auth.js";
import { dateFormatToISO } from "../utility/format.js";

const theadTag = document.querySelector("thead");
const tbodyTag = document.querySelector("tbody");
const dialog = document.querySelector("#edit-dialog");
const form = document.querySelector("#edit-form");
const cancelBtn = document.querySelector("#cancel-edit-btn"); // Updated to match HTML ID
const addProductsBtn = document.querySelector("#add-product-btn");
const addDialog = document.querySelector("#add-dialog");
const addForm = document.querySelector("#add-form");
const cancelAddBtn = document.querySelector("#cancel-add-btn"); // Fixed missing # selector

const user = getCurrentUser();

const displayTableHeads = (prod) => {
  const keys = Object.keys(prod[0]);
  const thDel = document.createElement("th");
  const thEdit = document.createElement("th");

  keys.forEach((key) => {
    if (key == "sellerId") {
      return;
    }
    const th = document.createElement("th");
    th.innerText = key;
    theadTag.append(th);
  });
  thDel.innerText = "Delete";
  thEdit.innerText = "Edit";

  theadTag.append(thDel);
  theadTag.append(thEdit);
};

const displayTableBody = (prod) => {
  prod.forEach((item) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id);

    for (const data in item) {
      if (data == "sellerId") {
        continue;
      }
      
      const td = document.createElement("td");
      
      // Special handling for image column
      if (data === "image" && item[data]) {
        // Create image element
        const img = document.createElement("img");
        img.src = item[data];
        img.alt = item.name || "Product image";
        img.className = "product-table-image";
        td.appendChild(img);
        td.classList.add("image-cell");
      } else {
        td.innerText = item[data];
      }
      
      tr.append(td);
    }

    // Create delete button cell
    const delTd = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.classList.add("del-btn");
    delBtn.innerHTML = '<i class="fa fa-trash"></i>';
    delTd.append(delBtn);
    tr.append(delTd);
    
    // Create edit button cell
    const editTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.innerHTML = '<i class="fa fa-edit"></i>';
    editTd.append(editBtn);
    tr.append(editTd);
    tbodyTag.append(tr);
  });
};

try {
  const product = await getAllProductsBySellerId(user.id);
  displayTableHeads(product);
  displayTableBody(product);
} catch (error) {
  alert(error.message);
}

const rows = tbodyTag.querySelectorAll("tr");

rows.forEach((row) => {
  row.addEventListener("click", async (e) => {
    e.stopPropagation();

    // Check if the delete button or its icon was clicked
    if (e.target.classList.contains("del-btn") || 
        (e.target.tagName === "I" && e.target.parentElement.classList.contains("del-btn"))) {
      // Show the custom confirmation dialog
      const deleteDialog = document.getElementById('delete-confirm-dialog');
      const deleteIdField = document.getElementById('delete-product-id');
      
      // Store the product ID to be deleted
      deleteIdField.value = row.getAttribute("data-id");
      
      // Show the dialog
      deleteDialog.showModal();
    }

    // Check if the edit button or its icon was clicked
    if (e.target.classList.contains("edit-btn") || 
        (e.target.tagName === "I" && e.target.parentElement.classList.contains("edit-btn"))) {
      const data = row.querySelectorAll("td");
      document.querySelector("#edit-id").value = data[0].innerText;
      document.querySelector("#edit-name").value = data[1].innerText;
      document.querySelector("#edit-description").value = data[2].innerText;
      
      // Set the category dropdown to the correct value
      const categorySelect = document.querySelector("#edit-cat");
      const categoryValue = data[3].innerText;
      
      // Find the matching option or default to the first option
      let optionFound = false;
      for (let i = 0; i < categorySelect.options.length; i++) {
        if (categorySelect.options[i].value === categoryValue) {
          categorySelect.selectedIndex = i;
          optionFound = true;
          break;
        }
      }
      
      // If no matching option was found, add the current category as a new option
      if (!optionFound && categoryValue) {
        const newOption = document.createElement('option');
        newOption.value = categoryValue;
        newOption.text = categoryValue;
        categorySelect.add(newOption);
        categorySelect.value = categoryValue;
      }
      
      document.querySelector("#edit-price").value = data[4].innerText;
      document.querySelector("#edit-stock").value = data[5].innerText;
      
      // Get the image URL from the img element in the image cell
      const imageCell = data[7];
      const imageElement = imageCell.querySelector('img');
      const imageUrl = imageElement ? imageElement.src : '';
      document.querySelector("#edit-Image").value = imageUrl;
      
      // Initialize the image preview
      updateEditImagePreview();

      dialog.showModal();
    }
  });
});

cancelBtn.addEventListener("click", () => {
  dialog.close();
});

// Fix cancel button for add dialog
document.querySelector("#cancel-add-btn").addEventListener("click", () => {
  addDialog.close();
});

// Image preview functions
function updateEditImagePreview() {
  const imageUrl = document.getElementById('edit-Image').value;
  const imagePreview = document.getElementById('edit-image-preview');
  
  if (imageUrl && isValidUrl(imageUrl)) {
    imagePreview.src = imageUrl;
    imagePreview.style.display = 'block';
  } else {
    imagePreview.src = '';
    imagePreview.style.display = 'none';
  }
}

function updateAddImagePreview() {
  const imageUrl = document.getElementById('add-Image').value;
  const imagePreview = document.getElementById('add-image-preview');
  
  if (imageUrl && isValidUrl(imageUrl)) {
    imagePreview.src = imageUrl;
    imagePreview.style.display = 'block';
  } else {
    imagePreview.src = '';
    imagePreview.style.display = 'none';
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedItem = {
    id: document.querySelector("#edit-id").value,
    name: document.querySelector("#edit-name").value,
    description: document.querySelector("#edit-description").value,
    category: document.querySelector("#edit-cat").value,
    price: document.querySelector("#edit-price").value,
    stock: document.querySelector("#edit-stock").value,
    image: document.querySelector("#edit-Image").value,
  };

  try {
    await updateProductById(updatedItem);
    dialog.close();
    location.reload();
  } catch (err) {
    alert(err.message);
  }
});

// Delete confirmation dialog event listeners
const deleteDialog = document.getElementById('delete-confirm-dialog');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

confirmDeleteBtn.addEventListener('click', async () => {
  const productId = document.getElementById('delete-product-id').value;
  if (productId) {
    try {
      await deleteProductById(productId);
      // Find and remove the row from the table
      const row = document.querySelector(`tr[data-id="${productId}"]`);
      if (row) row.remove();
      
      // Success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.textContent = 'Product deleted successfully';
      document.body.appendChild(successMsg);
      
      // Remove the message after 3 seconds
      setTimeout(() => {
        successMsg.remove();
      }, 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }
  deleteDialog.close();
});

cancelDeleteBtn.addEventListener('click', () => {
  deleteDialog.close();
});

addProductsBtn.addEventListener("click", () => {
  addDialog.showModal();
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const obj = {
    sellerId: user.id,
    name: document.querySelector("#add-name").value,
    description: document.querySelector("#add-description").value,
    category: document.querySelector("#add-cat").value,
    price: document.querySelector("#add-price").value,
    stock: document.querySelector("#add-stock").value,
    approved: false,
    image: document.querySelector("#add-Image").value,
    createdAt: dateFormatToISO(new Date()),
  };
  console.log(obj);
  try {
    await addNewProduct(obj);
    addDialog.close();
    location.reload();
  } catch (error) {}
});
