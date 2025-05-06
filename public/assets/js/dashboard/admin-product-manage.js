import {
  getAllProducts,
  deleteProductById,
  updateProductById,
} from "../api.js";

const theadTag = document.querySelector("thead");
const tbodyTag = document.querySelector("tbody");
const dialog = document.querySelector("#edit-dialog");
const form = document.querySelector("#edit-form");
const cancelBtn = document.querySelector("#cancel-btn");

const displayTableHeads = (prod) => {
  const keys = Object.keys(prod[0]);
  const thDel = document.createElement("th");
  const thEdit = document.createElement("th");
  const thApproval = document.createElement("th");

  keys.forEach((key) => {
    const th = document.createElement("th");
    th.innerText = key;
    theadTag.append(th);
  });
  thDel.innerText = "Delete";
  thEdit.innerText = "Edit";
  thApproval.innerText = "Approval Toggle";

  theadTag.append(thDel);
  theadTag.append(thEdit);
  theadTag.append(thApproval);
};

const displayTableBody = (prod) => {
  prod.forEach((item) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id);

    for (const data in item) {
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
    const toggleApprovalTd = document.createElement("td");
    const toggleApprovalBtn = document.createElement("button");

    toggleApprovalBtn.classList.add("toggle-approval");
    toggleApprovalBtn.classList.add(item.approved ? "reject" : "approve");
    toggleApprovalBtn.innerText = item.approved ? "reject" : "approve";

    toggleApprovalTd.append(toggleApprovalBtn);
    tr.append(toggleApprovalTd);

    tbodyTag.append(tr);
  });
};

try {
  const product = await getAllProducts();
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
      document.querySelector("#edit-name").value = data[2].innerText;
      document.querySelector("#edit-description").value = data[3].innerText;
      document.querySelector("#edit-cat").value = data[4].innerText;
      document.querySelector("#edit-price").value = data[5].innerText;
      document.querySelector("#edit-stock").value = data[6].innerText;
      document.querySelector("#edit-Image").value = data[8].innerText;

      dialog.showModal();
    }

    if (e.target.classList.contains("toggle-approval")) {
      const currentApproval = row.querySelectorAll("td")[7].innerText;

      const obj = {
        id: row.getAttribute("data-id"),
        approved: currentApproval === "true" ? false : true,
      };

      await updateProductById(obj);
      location.reload();
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
