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
  // Create a table row for the headers
  const headerRow = document.createElement("tr");
  theadTag.appendChild(headerRow);
  
  // Define which columns to display and their display names
  const displayColumns = [
    { key: 'id', display: 'ID' },
    { key: 'name', display: 'Product Name' },
    { key: 'category', display: 'Category' },
    { key: 'price', display: 'Price' },
    { key: 'stock', display: 'Stock' },
    { key: 'approved', display: 'Status' },
    { key: 'actions', display: 'Actions' }
  ];
  
  // Create header cells
  displayColumns.forEach(column => {
    const th = document.createElement("th");
    th.innerText = column.display;
    headerRow.appendChild(th);
  });
};

const displayTableBody = (prod) => {
  prod.forEach((item) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id);

    // ID cell
    const idTd = document.createElement("td");
    idTd.innerText = item.id;
    tr.appendChild(idTd);
    
    // Name cell
    const nameTd = document.createElement("td");
    nameTd.innerText = item.name;
    tr.appendChild(nameTd);
    
    // Category cell
    const categoryTd = document.createElement("td");
    categoryTd.innerText = item.category;
    tr.appendChild(categoryTd);
    
    // Price cell
    const priceTd = document.createElement("td");
    priceTd.innerText = `$${parseFloat(item.price).toFixed(2)}`;
    tr.appendChild(priceTd);
    
    // Stock cell
    const stockTd = document.createElement("td");
    stockTd.innerText = item.stock;
    tr.appendChild(stockTd);
    
    // Status cell with badge
    const statusTd = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.classList.add("status-badge");
    
    if (item.approved) {
      statusBadge.classList.add("status-delivered");
      statusBadge.innerText = "Approved";
    } else {
      statusBadge.classList.add("status-pending");
      statusBadge.innerText = "Pending";
    }
    
    statusTd.appendChild(statusBadge);
    tr.appendChild(statusTd);
    
    // Actions cell with buttons
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("actions-cell");
    
    // Edit button
    const editBtn = document.createElement("button");
    editBtn.classList.add("btn", "btn-edit");
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = "Edit Product";
    actionsTd.appendChild(editBtn);
    
    // Delete button
    const delBtn = document.createElement("button");
    delBtn.classList.add("btn", "btn-danger");
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    delBtn.title = "Delete Product";
    actionsTd.appendChild(delBtn);
    
    // Approval toggle button
    const toggleApprovalBtn = document.createElement("button");
    toggleApprovalBtn.classList.add("btn", "toggle-approval");
    
    if (item.approved) {
      toggleApprovalBtn.classList.add("btn-danger");
      toggleApprovalBtn.innerHTML = '<i class="fas fa-times"></i>';
      toggleApprovalBtn.title = "Reject Product";
    } else {
      toggleApprovalBtn.classList.add("btn-primary");
      toggleApprovalBtn.innerHTML = '<i class="fas fa-check"></i>';
      toggleApprovalBtn.title = "Approve Product";
    }
    
    actionsTd.appendChild(toggleApprovalBtn);
    tr.appendChild(actionsTd);

    tbodyTag.appendChild(tr);
  });
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

// Load products data
try {
  const product = await getAllProducts();
  if (product && product.length > 0) {
    displayTableHeads(product);
    displayTableBody(product);
  } else {
    tbodyTag.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 20px;">
          <p>No products found. Add some products to get started.</p>
        </td>
      </tr>
    `;
  }
} catch (error) {
  console.error('Error loading products:', error);
  tbodyTag.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 20px; color: #ff5252;">
        <p>Error loading products: ${error.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </td>
    </tr>
  `;
}

const rows = tbodyTag.querySelectorAll("tr");

rows.forEach((row) => {
  row.addEventListener("click", async (e) => {
    e.stopPropagation();
    const target = e.target.closest('button') || e.target;
    const productId = row.getAttribute("data-id");
    
    // Handle delete button click
    if (target.classList.contains("btn-danger") && target.innerHTML.includes('fa-trash')) {
      // Get the product name for the confirmation message
      const productName = row.querySelector('td:nth-child(2)').textContent;
      const confirmDialog = document.getElementById('confirm-dialog');
      const confirmMessage = document.getElementById('confirm-message');
      const confirmDeleteBtn = document.getElementById('confirm-delete');
      const cancelDeleteBtn = document.getElementById('cancel-delete');
      
      // Update confirmation message with product name
      confirmMessage.textContent = `Are you sure you want to delete "${productName}"? This action cannot be undone.`;
      
      // Show the confirmation dialog
      confirmDialog.showModal();
      
      // Handle confirmation dialog buttons
      const handleDelete = async () => {
        try {
          await deleteProductById(productId);
          row.remove();
          confirmDialog.close();
          
          // Show a temporary success message
          const tableContainer = document.querySelector('.table-container');
          const successMsg = document.createElement('div');
          successMsg.className = 'success-message';
          successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Product "${productName}" deleted successfully`;
          tableContainer.insertAdjacentElement('beforebegin', successMsg);
          
          // Remove the success message after 3 seconds
          setTimeout(() => {
            successMsg.style.opacity = '0';
            setTimeout(() => successMsg.remove(), 500);
          }, 3000);
          
        } catch (error) {
          confirmDialog.close();
          console.error('Error deleting product:', error);
          
          // Show error message
          const tableContainer = document.querySelector('.table-container');
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error deleting product: ${error.message}`;
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

    // Handle edit button click
    if (target.classList.contains("btn-edit") || target.closest('.btn-edit')) {
      // Get the product details from the API to ensure we have all data
      const products = await getAllProducts();
      const product = products.find(p => p.id === productId);
      
      if (product) {
        document.querySelector("#edit-id").value = product.id;
        document.querySelector("#edit-name").value = product.name;
        document.querySelector("#edit-description").value = product.description;
        document.querySelector("#edit-cat").value = product.category;
        document.querySelector("#edit-price").value = product.price;
        document.querySelector("#edit-stock").value = product.stock;
        document.querySelector("#edit-Image").value = product.image;

        dialog.showModal();
      }
    }

    // Handle approval toggle button click
    if (target.classList.contains("toggle-approval") || target.closest('.toggle-approval')) {
      const statusBadge = row.querySelector('.status-badge');
      const isCurrentlyApproved = statusBadge.textContent === 'Approved';

      const obj = {
        id: productId,
        approved: !isCurrentlyApproved
      };

      try {
        await updateProductById(obj);
        // Update the UI without reloading the page
        if (isCurrentlyApproved) {
          statusBadge.textContent = 'Pending';
          statusBadge.className = 'status-badge status-pending';
          target.innerHTML = '<i class="fas fa-check"></i>';
          target.title = 'Approve Product';
          target.className = 'btn toggle-approval btn-primary';
        } else {
          statusBadge.textContent = 'Approved';
          statusBadge.className = 'status-badge status-delivered';
          target.innerHTML = '<i class="fas fa-times"></i>';
          target.title = 'Reject Product';
          target.className = 'btn toggle-approval btn-danger';
        }
      } catch (error) {
        alert(`Error updating product status: ${error.message}`);
      }
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
