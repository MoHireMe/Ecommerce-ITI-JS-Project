import {
  getAllOrders,
  deleteOrderById,
  updateOrderById,
  getOrderProductsById,
  getProductNameById,
} from "../api.js";

const theadTag = document.querySelector("thead");
const tbodyTag = document.querySelector("tbody");
const dialog = document.querySelector("#product-dialog");
let cancelBtn;

const displayTableHeads = (ord) => {
  const keys = Object.keys(ord[0]);
  const thDel = document.createElement("th");
  const thEdit = document.createElement("th");
  const thApproval = document.createElement("th");

  keys.forEach((key) => {
    if (key == "products") {
      return;
    }
    const th = document.createElement("th");
    th.innerText = key;
    theadTag.append(th);
  });
  thDel.innerText = "Delete";
  thEdit.innerText = "Show Products";
  thApproval.innerText = "Status Change";

  theadTag.append(thDel);
  theadTag.append(thEdit);
  theadTag.append(thApproval);
};

const displayTableBody = (ord) => {
  ord.forEach((item) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id);

    for (const data in item) {
      if (data == "products") {
        continue;
      }
      const td = document.createElement("td");
      td.innerText = item[data];
      tr.append(td);
    }

    for (const el of [
      ["del-btn", "🗑️"],
      ["show-products", "Show Products"],
    ]) {
      const td = document.createElement("td");
      const btn = document.createElement("button");

      btn.classList.add(el[0]);
      btn.innerText = el[1];

      td.append(btn);
      tr.append(td);
    }
    const SelectTd = document.createElement("td");
    const Select = document.createElement("Select");

    Select.classList.add("status-select");
    for (const opt of ["pending", "shipped", "delivered"]) {
      const option = document.createElement("option");
      option.value = opt;
      option.innerText = opt;
      if (item.status == opt) {
        option.selected = true;
      }
      Select.append(option);
    }

    SelectTd.append(Select);
    tr.append(SelectTd);
    tbodyTag.append(tr);
  });
};

try {
  const orders = await getAllOrders();
  displayTableHeads(orders);
  displayTableBody(orders);
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
        try {
          await deleteOrderById(row.getAttribute("data-id"));
          row.remove();
          alert("Item Deleted");
        } catch (error) {
          alert("Item not Deleted", error.message);
        }
      } else {
        alert("Item not Deleted");
      }
    }

    if (e.target.classList.contains("show-products")) {
      try {
        const productOfOrder = await getOrderProductsById(
          row.getAttribute("data-id")
        );

        const table = document.createElement("table");
        const head = document.createElement("thead");
        const body = document.createElement("tbody");

        cancelBtn = document.createElement("button");
        cancelBtn.id = "cancel-btn";
        cancelBtn.innerText = "X";

        productOfOrder.forEach((prod) => {
          const keys = Object.keys(prod);
          for (const h of keys) {
            const th = document.createElement("th");
            th.innerText = h;
            head.append(th);
          }
          const th = document.createElement("th");
          th.innerText = "Product Name";
          head.append(th);
        });

        productOfOrder.forEach(async (prod) => {
          const tr = document.createElement("tr");
          for (const data in prod) {
            const td = document.createElement("td");
            td.innerText = prod[data];
            tr.append(td);
          }
          const td = document.createElement("td");
          td.innerText = await getProductNameById(prod.productId);
          tr.append(td);
          body.append(tr);
        });

        table.append(head);
        table.append(body);
        dialog.append(cancelBtn);
        dialog.append(table);
        dialog.showModal();

        cancelBtn.addEventListener("click", () => {
          dialog.innerHTML = "";
          dialog.close();
        });
      } catch (error) {}
    }
  });

  row.addEventListener("change", async (e) => {
    if (e.target.classList.contains("status-select")) {
      const obj = {
        id: row.getAttribute("data-id"),
        status: e.target.value,
      };
      await updateOrderById(obj);
      location.reload();
    }
  });
});

// cancelBtn.addEventListener("click", () => {
//   dialog.close();
// });
