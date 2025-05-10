import {
  getAllOrders,
  updateOrderById,
  getOrderProductsById,
  getProductNameById,
} from "../api.js";
import { getCurrentUser } from "../auth.js";

const theadTag = document.querySelector("thead");
const tbodyTag = document.querySelector("tbody");
const dialog = document.querySelector("#product-dialog");
let cancelBtn;

const user = getCurrentUser();

const displayTableHeads = (ord) => {
  const keys = Object.keys(ord[0]);
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
  thEdit.innerText = "Show Products";
  thApproval.innerText = "Status Change";

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

    for (const el of [["show-products", "Show Products"]]) {
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
  const sellerOrders = orders.filter((order) =>
    order.products.some((product) => product.sellerId === user.id)
  );
  console.log(sellerOrders);

  displayTableHeads(sellerOrders);
  displayTableBody(sellerOrders);
} catch (error) {
  alert(error.message);
}
const rows = tbodyTag.querySelectorAll("tr");

rows.forEach((row) => {
  row.addEventListener("click", async (e) => {
    e.stopPropagation();

    if (e.target.classList.contains("show-products")) {
      try {
        const orderId = row.getAttribute("data-id");
        let productOfOrder = await getOrderProductsById(orderId);
        
        // Ensure productOfOrder is always an array, even if null or undefined is returned
        if (!productOfOrder || !Array.isArray(productOfOrder)) {
          console.warn(`No products found for order ${orderId} or invalid products data`);
          productOfOrder = [];
        }
        
        const filteredProducts = productOfOrder.filter(
          (item) => item && item.sellerId == user.id
        );
        const table = document.createElement("table");
        const head = document.createElement("thead");
        const body = document.createElement("tbody");

        cancelBtn = document.createElement("button");
        cancelBtn.id = "cancel-btn";
        cancelBtn.innerText = "X";

        const firstProduct = productOfOrder[0];
        if (firstProduct) {
          const keys = Object.keys(firstProduct);
          for (const h of keys) {
            const th = document.createElement("th");
            th.innerText = h;
            head.append(th);
          }

          const th = document.createElement("th");
          th.innerText = "Product Name";
          head.append(th);
        }
        console.log(productOfOrder);
        filteredProducts.forEach(async (prod) => {
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
