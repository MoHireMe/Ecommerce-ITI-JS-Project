import {
  getAllOrders,
  updateOrderById,
  getOrderProductsById,
  getProductNameById,
  getAllProductsBySellerId,
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
      
      // Style the status cell with appropriate colors
      if (data === 'status') {
        td.classList.add('order-status');
        const statusBadge = document.createElement('span');
        statusBadge.classList.add('status-badge');
        
        // Apply specific status styling based on value
        switch(item[data]) {
          case 'pending':
            statusBadge.classList.add('status-pending');
            break;
          case 'shipped':
            statusBadge.classList.add('status-shipped');
            break;
          case 'delivered':
            statusBadge.classList.add('status-delivered');
            break;
        }
        
        statusBadge.textContent = item[data];
        td.appendChild(statusBadge);
      } else {
        td.innerText = item[data];
      }
      
      tr.append(td);
    }

    // Add Show Products button with admin styling
    const actionTd = document.createElement("td");
    const actionBtn = document.createElement("button");

    actionBtn.classList.add("show-products", "btn", "btn-info");
    actionBtn.innerHTML = '<i class="fa fa-eye"></i> Show Products';

    actionTd.append(actionBtn);
    tr.append(actionTd);
    
    // Add status select dropdown with admin styling
    const statusTd = document.createElement("td");
    const statusSelect = document.createElement("select");

    statusSelect.classList.add("status-select", "form-control");
    
    // Add options for the three allowed statuses: pending, shipped, delivered
    for (const opt of ["pending", "shipped", "delivered"]) {
      const option = document.createElement("option");
      option.value = opt;
      option.innerText = opt.charAt(0).toUpperCase() + opt.slice(1); // Capitalize first letter
      
      // Set selected option based on current status
      if (item.status == opt) {
        option.selected = true;
        // Add class to the select based on current status
        statusSelect.classList.add(`status-${opt}`);
      }
      
      statusSelect.append(option);
    }

    // Add event listener to update select styling when status changes
    statusSelect.addEventListener('change', function() {
      // Remove all status classes
      this.classList.remove('status-pending', 'status-shipped', 'status-delivered');
      // Add class for the new status
      this.classList.add(`status-${this.value}`);
    });

    statusTd.append(statusSelect);
    tr.append(statusTd);
    tbodyTag.append(tr);
  });
};

try {
  const orders = await getAllOrders();
  // Get all products created by this seller
  const sellerProducts = await getAllProductsBySellerId(user.id);
  const sellerProductIds = sellerProducts.map(product => product.id);
  
  // Filter orders that contain products created by this seller
  const sellerOrders = orders.filter((order) => {
    if (!order.products || !Array.isArray(order.products)) return false;
    
    return order.products.some((product) => {
      // Check if product has a sellerId that matches the current user
      if (product.sellerId && product.sellerId === user.id) {
        return true;
      }
      
      // If sellerId is missing, check if the productId matches any of this seller's products
      return sellerProductIds.includes(product.productId || product.id);
    });
  });
  
  console.log("Seller orders:", sellerOrders);

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
        
        // Get all products created by this seller for reference
        const sellerProducts = await getAllProductsBySellerId(user.id);
        const sellerProductIds = sellerProducts.map(product => product.id);
        
        // Filter products that belong to this seller
        const filteredProducts = productOfOrder.filter(item => {
          if (!item) return false;
          
          // If product has sellerId that matches current user
          if (item.sellerId && item.sellerId === user.id) {
            return true;
          }
          
          // If sellerId is missing, check if productId matches any of seller's products
          return sellerProductIds.includes(item.productId || item.id);
        });
        const table = document.createElement("table");
        table.classList.add("styled-table");
        const head = document.createElement("thead");
        const body = document.createElement("tbody");
        
        // Use the close button we added to the HTML instead of creating a new one
        const closeBtn = document.getElementById("close-product-dialog");
        closeBtn.addEventListener("click", () => {
          document.getElementById("product-dialog").close();
        });

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
        
        // Clear previous content and add new table to the dialog content div
        const dialogContent = document.getElementById('product-dialog-content');
        dialogContent.innerHTML = '';
        dialogContent.appendChild(table);
        
        // Show the dialog
        dialog.showModal();
        
        // Event listener for close button is already added above
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
