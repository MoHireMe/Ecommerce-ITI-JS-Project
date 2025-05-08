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
const cancelBtn = document.querySelector("#cancel-btn");
const addProductsBtn = document.querySelector("#add-product-btn");
const addDialog = document.querySelector("#add-dialog");
const addForm = document.querySelector("#add-form");
const cancelAddBtn = document.querySelector("cancel-add-btn");

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
      td.innerText = item[data];
      tr.append(td);
    }

    for (const el of [
      ["del-btn", "🗑️"],
      ["edit-btn", "Edit"],
    ]) {
      const td = document.createElement("td");
      const btn = document.createElement("button");

      btn.classList.add(el[0]);
      btn.innerText = el[1];

      td.append(btn);
      tr.append(td);
    }
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

    if (e.target.classList.contains("del-btn")) {
      const confirmMsg = confirm("Are you sure you want to delete this item");
      if (confirmMsg) {
        await deleteProductById(row.getAttribute("data-id"));
        row.remove();
        alert("Item Deleted");
      } else {
        alert("Item not Deleted");
      }
    }

    if (e.target.classList.contains("edit-btn")) {
      const data = row.querySelectorAll("td");
      document.querySelector("#edit-id").value = data[0].innerText;
      document.querySelector("#edit-name").value = data[1].innerText;
      document.querySelector("#edit-description").value = data[2].innerText;
      document.querySelector("#edit-cat").value = data[3].innerText;
      document.querySelector("#edit-price").value = data[4].innerText;
      document.querySelector("#edit-stock").value = data[5].innerText;
      document.querySelector("#edit-Image").value = data[7].innerText;

      dialog.showModal();
    }
  });
});

cancelBtn.addEventListener("click", () => {
  dialog.close();
});

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
