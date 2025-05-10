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
  // Create a table row for the headers
  const headerRow = document.createElement("tr");
  theadTag.appendChild(headerRow);
  
  // Define which columns to display and their display names
  const displayColumns = [
    { key: 'id', display: 'Order ID' },
    { key: 'customerId', display: 'Customer' },
    { key: 'total', display: 'Total Amount' },
    { key: 'status', display: 'Status' },
    { key: 'date', display: 'Order Date' },
    { key: 'actions', display: 'Actions' }
  ];
  
  // Create header cells
  displayColumns.forEach(column => {
    const th = document.createElement("th");
    th.innerText = column.display;
    headerRow.appendChild(th);
  });
};

const displayTableBody = (ord) => {
  ord.forEach((item) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id);

    // Order ID cell
    const idTd = document.createElement("td");
    idTd.innerText = item.id;
    tr.appendChild(idTd);
    
    // Customer ID cell
    const customerTd = document.createElement("td");
    customerTd.innerText = item.customerId;
    tr.appendChild(customerTd);
    
    // Total amount cell
    const totalTd = document.createElement("td");
    totalTd.innerText = `$${parseFloat(item.total).toFixed(2)}`;
    tr.appendChild(totalTd);
    
    // Status cell with badge
    const statusTd = document.createElement("td");
    statusTd.setAttribute('data-status', item.status);
    const statusBadge = document.createElement("span");
    statusBadge.classList.add("status-badge", `status-${item.status.toLowerCase()}`);
    statusBadge.innerText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    statusTd.appendChild(statusBadge);
    tr.appendChild(statusTd);
    
    // Date cell - format the date nicely
    const dateTd = document.createElement("td");
    const orderDate = new Date(item.date || item.createdAt);
    dateTd.innerText = orderDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    tr.appendChild(dateTd);
    
    // Actions cell with buttons
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("actions-cell");
    
    // View products button
    const viewBtn = document.createElement("button");
    viewBtn.classList.add("btn", "btn-primary", "show-products");
    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    viewBtn.title = "View Order Items";
    actionsTd.appendChild(viewBtn);
    
    // Status select dropdown
    const statusSelect = document.createElement("select");
    
    // Add status-select class and status-specific class
    statusSelect.classList.add('status-select', `status-${item.status}`);
    
    statusSelect.innerHTML = `
      <option value="pending" ${item.status === "pending" ? "selected" : ""}>Pending</option>
      <option value="shipped" ${item.status === "shipped" ? "selected" : ""}>Shipped</option>
      <option value="delivered" ${item.status === "delivered" ? "selected" : ""}>Delivered</option>
    `;
    
    statusSelect.addEventListener("change", async () => {
      try {
        // Create the proper update object with id and status
        const updateObj = {
          id: item.id,
          status: statusSelect.value
        };
        
        await updateOrderById(updateObj);
        
        // Update the select's status class when status changes
        statusSelect.classList.remove('status-pending', 'status-shipped', 'status-delivered');
        statusSelect.classList.add(`status-${statusSelect.value}`);
        
        // Update the status badge in the status cell
        const statusBadge = statusTd.querySelector('.status-badge');
        if (statusBadge) {
          statusBadge.classList.remove('status-pending', 'status-shipped', 'status-delivered');
          statusBadge.classList.add(`status-${statusSelect.value}`);
          statusBadge.textContent = statusSelect.value.charAt(0).toUpperCase() + statusSelect.value.slice(1);
        }
        
        // Show a temporary success message
        const tableContainer = document.querySelector('.table-container');
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Order #${item.id} status updated to ${statusSelect.value}`;
        tableContainer.insertAdjacentElement('beforebegin', successMsg);
        
        // Remove the success message after 3 seconds
        setTimeout(() => {
          successMsg.style.opacity = '0';
          setTimeout(() => successMsg.remove(), 500);
        }, 3000);
        
      } catch (error) {
        // Show error message
        const tableContainer = document.querySelector('.table-container');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error updating order status: ${error.message}`;
        tableContainer.insertAdjacentElement('beforebegin', errorMsg);
        
        // Remove the error message after 5 seconds
        setTimeout(() => {
          errorMsg.style.opacity = '0';
          setTimeout(() => errorMsg.remove(), 500);
        }, 5000);
      }
    });
    
    // Add the select to the actions cell
    actionsTd.appendChild(statusSelect);
    
    // Delete button
    const delBtn = document.createElement("button");
    delBtn.classList.add("btn", "btn-danger", "del-btn");
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    delBtn.title = "Delete Order";
    actionsTd.appendChild(delBtn);
    
    tr.appendChild(actionsTd);
    tbodyTag.appendChild(tr);
  });
  
  // Call the styleStatusCells function to apply styling to status badges
  if (window.styleStatusCells) {
    window.styleStatusCells();
  }
};

// Initialize the main content margin based on sidebar state
document.addEventListener('DOMContentLoaded', function() {
  const dashboardSidebar = document.getElementById('dashboard-sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (dashboardSidebar && mainContent) {
    if (dashboardSidebar.classList.contains('expanded')) {
      mainContent.classList.add('sidebar-expanded');
    }
  }
});

// Load orders data
try {
  const orders = await getAllOrders();
  if (orders && orders.length > 0) {
    displayTableHeads(orders);
    displayTableBody(orders);
  } else {
    tbodyTag.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px;">
          <p>No orders found. Orders will appear here when customers make purchases.</p>
        </td>
      </tr>
    `;
  }
} catch (error) {
  console.error('Error loading orders:', error);
  tbodyTag.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 20px; color: #ff5252;">
        <p>Error loading orders: ${error.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </td>
    </tr>
  `;
}

const rows = tbodyTag.querySelectorAll("tr");

rows.forEach((row) => {
  row.addEventListener("click", async (e) => {
    e.stopPropagation();

    if (e.target.classList.contains("del-btn") || (e.target.closest('.del-btn'))) {
      // Get the order ID for the confirmation message
      const orderId = row.getAttribute("data-id");
      const confirmDialog = document.getElementById('confirm-dialog');
      const confirmMessage = document.getElementById('confirm-message');
      const confirmDeleteBtn = document.getElementById('confirm-delete');
      const cancelDeleteBtn = document.getElementById('cancel-delete');
      
      // Update confirmation message with order ID
      confirmMessage.textContent = `Are you sure you want to delete Order #${orderId}? This action cannot be undone.`;
      
      // Show the confirmation dialog
      confirmDialog.showModal();
      
      // Handle confirmation dialog buttons
      const handleDelete = async () => {
        try {
          await deleteOrderById(orderId);
          row.remove();
          confirmDialog.close();
          
          // Show a temporary success message
          const tableContainer = document.querySelector('.table-container');
          const successMsg = document.createElement('div');
          successMsg.className = 'success-message';
          successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Order #${orderId} deleted successfully`;
          tableContainer.insertAdjacentElement('beforebegin', successMsg);
          
          // Remove the success message after 3 seconds
          setTimeout(() => {
            successMsg.style.opacity = '0';
            setTimeout(() => successMsg.remove(), 500);
          }, 3000);
          
        } catch (error) {
          confirmDialog.close();
          console.error('Error deleting order:', error);
          
          // Show error message
          const tableContainer = document.querySelector('.table-container');
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error deleting order: ${error.message}`;
          tableContainer.insertAdjacentElement('beforebegin', errorMsg);
          
          // Remove the error message after 5 seconds
          setTimeout(() => {
            errorMsg.style.opacity = '0';
            setTimeout(() => errorMsg.remove(), 500);
          }, 5000);
        }
        
        // Remove event listeners
        confirmDeleteBtn.removeEventListener('click', handleDelete);
        cancelDeleteBtn.removeEventListener('click', handleCancel);
      };
      
      const handleCancel = () => {
        confirmDialog.close();
        // Remove event listeners
        confirmDeleteBtn.removeEventListener('click', handleDelete);
        cancelDeleteBtn.removeEventListener('click', handleCancel);
      };
      
      // Add event listeners
      confirmDeleteBtn.addEventListener('click', handleDelete);
      cancelDeleteBtn.addEventListener('click', handleCancel);
    }

    if (e.target.classList.contains("show-products") || e.target.closest('.show-products')) {
      try {
        const orderId = row.getAttribute("data-id");
        let productOfOrder = await getOrderProductsById(orderId);
        
        // Ensure productOfOrder is always an array, even if null or undefined is returned
        if (!productOfOrder || !Array.isArray(productOfOrder)) {
          console.warn(`No products found for order ${orderId} or invalid products data`);
          productOfOrder = [];
        }

        // Clear previous dialog content
        dialog.innerHTML = '';
        
        // Create dialog header
        const dialogHeader = document.createElement('div');
        dialogHeader.className = 'dialog-header';
        
        const dialogTitle = document.createElement('h3');
        dialogTitle.innerText = `Order Details - #${orderId}`;
        dialogHeader.appendChild(dialogTitle);
        
        cancelBtn = document.createElement("button");
        cancelBtn.id = "cancel-btn";
        cancelBtn.className = "btn";
        cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
        dialogHeader.appendChild(cancelBtn);
        
        dialog.appendChild(dialogHeader);
        
        // Create table for order items
        const table = document.createElement("table");
        table.className = "order-items-table";
        
        const head = document.createElement("thead");
        const headerRow = document.createElement("tr");
        
        // Define columns for order items table
        const columns = [
          { key: 'name', display: 'Product Name' },
          { key: 'quantity', display: 'Quantity' },
          { key: 'price', display: 'Price' },
          { key: 'total', display: 'Total' }
        ];
        
        columns.forEach(column => {
          const th = document.createElement("th");
          th.innerText = column.display;
          headerRow.appendChild(th);
        });
        
        head.appendChild(headerRow);
        table.appendChild(head);
        
        const body = document.createElement("tbody");
        
        // Process each product in the order
        let orderTotal = 0;
        const processProducts = async () => {
          for (const prod of productOfOrder) {
            const tr = document.createElement("tr");
            
            // Product name cell
            const nameTd = document.createElement("td");
            if (prod.name) {
              nameTd.innerText = prod.name;
            } else {
              nameTd.innerText = await getProductNameById(prod.productId);
            }
            tr.appendChild(nameTd);
            
            // Quantity cell
            const quantityTd = document.createElement("td");
            quantityTd.innerText = prod.quantity;
            tr.appendChild(quantityTd);
            
            // Price cell
            const priceTd = document.createElement("td");
            const price = prod.price || prod.priceAtPurchase;
            priceTd.innerText = `$${parseFloat(price).toFixed(2)}`;
            tr.appendChild(priceTd);
            
            // Total cell
            const totalTd = document.createElement("td");
            const itemTotal = price * prod.quantity;
            orderTotal += itemTotal;
            totalTd.innerText = `$${itemTotal.toFixed(2)}`;
            tr.appendChild(totalTd);
            
            body.appendChild(tr);
          }
          
          // Add order total row
          const totalRow = document.createElement("tr");
          totalRow.className = "order-total-row";
          
          const totalLabelTd = document.createElement("td");
          totalLabelTd.colSpan = 3;
          totalLabelTd.style.textAlign = "right";
          totalLabelTd.style.fontWeight = "bold";
          totalLabelTd.innerText = "Order Total:";
          totalRow.appendChild(totalLabelTd);
          
          const totalValueTd = document.createElement("td");
          totalValueTd.style.fontWeight = "bold";
          totalValueTd.innerText = `$${orderTotal.toFixed(2)}`;
          totalRow.appendChild(totalValueTd);
          
          body.appendChild(totalRow);
        };
        
        await processProducts();
        table.appendChild(body);
        dialog.appendChild(table);
        
        dialog.showModal();

        cancelBtn.addEventListener("click", () => {
          dialog.innerHTML = "";
          dialog.close();
        });
      } catch (error) {
        console.error('Error showing order products:', error);
        alert(`Error loading order details: ${error.message}`);
      }
    }
  });

  row.addEventListener("change", async (e) => {
    if (e.target.classList.contains("status-select")) {
      const orderId = row.getAttribute("data-id");
      const newStatus = e.target.value;
      
      try {
        const obj = {
          id: orderId,
          status: newStatus,
        };
        await updateOrderById(obj);
        
        // Update the status badge without reloading the page
        const statusCell = row.querySelector('td[data-status]');
        if (statusCell) {
          statusCell.setAttribute('data-status', newStatus);
          
          const statusBadge = statusCell.querySelector('.status-badge');
          if (statusBadge) {
            statusBadge.className = `status-badge status-${newStatus.toLowerCase()}`;
            statusBadge.innerText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
          }
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        
        // Show error message
        const tableContainer = document.querySelector('.table-container');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error updating order status: ${error.message}`;
        tableContainer.insertAdjacentElement('beforebegin', errorMsg);
        
        // Remove the error message after 5 seconds
        setTimeout(() => {
          errorMsg.style.opacity = '0';
          setTimeout(() => errorMsg.remove(), 500);
        }, 5000);
        
        // Reset the select to the previous value
        e.target.value = row.querySelector('td[data-status]').getAttribute('data-status');
      }
    }
  });
});

// cancelBtn.addEventListener("click", () => {
//   dialog.close();
// });
