// MOBILE SIDEBAR
const menuBtn = document.querySelector(".mobile-menu-button");
const mobileSidebar = document.querySelector(".mobile-sidebar");
const closeBtn = document.querySelector(".close-btn");

menuBtn.addEventListener("click", () => {
  mobileSidebar.classList.add("active");
  document.body.classList.add("sidebar-open");
});

closeBtn.addEventListener("click", () => {
  mobileSidebar.classList.remove("active");
  document.body.classList.remove("sidebar-open");
});

// CART SIDEBAR
const cartIcon = document.querySelector(".fa-shopping-cart");
const cartSidebar = document.querySelector(".cart-sidebar");
const closeCart = document.querySelector(".close-cart");

// Function to remove item from cart
function removeFromCart(itemId) {
  try {
    // Get current cart items
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Filter out the item to remove
    cartItems = cartItems.filter(item => item.id !== itemId);
    
    // Update localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems));
    
    // Update cart count
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const countEl = document.querySelector("#cart-count");
    if (countEl) countEl.textContent = totalItems;
    
    // Re-render cart contents
    renderCartContents();
    
    console.log("Item removed from cart:", itemId);
  } catch (err) {
    console.error("Error removing item from cart:", err);
  }
}

// Function to update item quantity
function updateItemQuantity(itemId, change) {
  try {
    // Get current cart items
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Find the item to update
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    // Update quantity (minimum 1)
    item.quantity = Math.max(1, item.quantity + change);
    
    // Update localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems));
    
    // Update cart count
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const countEl = document.querySelector("#cart-count");
    if (countEl) countEl.textContent = totalItems;
    
    // Re-render cart contents
    renderCartContents();
    
    console.log(`Item ${itemId} quantity updated to ${item.quantity}`);
  } catch (err) {
    console.error("Error updating item quantity:", err);
  }
}

// Function to render cart contents
function renderCartContents() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.querySelector(".cart-items");
  const totalEl = document.getElementById("cart-total");
  const emptyMsg = document.querySelector(".empty-cart-msg");
  
  if (!container || !totalEl) return;
  
  // Clear previous content
  container.innerHTML = "";
  
  if (cartItems.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    totalEl.textContent = "0.00";
    return;
  }
  
  // Hide empty message
  if (emptyMsg) emptyMsg.style.display = "none";
  
  // Add items to cart
  let total = 0;
  cartItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");
    itemDiv.setAttribute("data-id", item.id);
    itemDiv.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="quantity-controls">
          <span class="quantity-btn minus" data-id="${item.id}">-</span>
          <span class="item-quantity">${item.quantity}</span>
          <span class="quantity-btn plus" data-id="${item.id}">+</span>
        </div>
      </div>
      <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
      <span class="delete-btn" data-id="${item.id}"><i class="fas fa-times"></i></span>
    `;
    
    // Add delete functionality
    const deleteBtn = itemDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const itemId = this.getAttribute('data-id');
      removeFromCart(itemId);
    });
    
    // Add quantity control functionality
    const minusBtn = itemDiv.querySelector('.quantity-btn.minus');
    const plusBtn = itemDiv.querySelector('.quantity-btn.plus');
    
    minusBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const itemId = this.getAttribute('data-id');
      updateItemQuantity(itemId, -1); // Decrease quantity by 1
    });
    
    plusBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const itemId = this.getAttribute('data-id');
      updateItemQuantity(itemId, 1); // Increase quantity by 1
    });
    container.appendChild(itemDiv);
    total += item.price * item.quantity;
  });
  
  // Update total
  totalEl.textContent = total.toFixed(2);
}

// Open cart sidebar and render contents with authentication check
cartIcon.addEventListener("click", async () => {
  try {
    // Import auth functions
    const authModule = await import('./auth.js');
    const { isLoggedIn, checkUserRole } = authModule;
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      alert('You need to be logged in to view your cart.');
      window.location.href = './login.html';
      return;
    }
    
    // Check if user is a customer
    if (!checkUserRole('customer')) {
      alert('Only customers can access the shopping cart.');
      window.location.href = './login.html';
      return;
    }
    
    // If authenticated as customer, open cart
    cartSidebar.classList.add("open");
    renderCartContents(); // Render cart contents when sidebar is opened
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
});

closeCart.addEventListener("click", () => {
  cartSidebar.classList.remove("open");
});

// Add checkout button functionality with authentication check
document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.querySelector('.checkout-btn');
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      try {
        // Import auth functions
        const authModule = await import('./auth.js');
        const { isLoggedIn, checkUserRole } = authModule;
        
        // Check if user is logged in
        if (!isLoggedIn()) {
          alert('You need to be logged in to checkout.');
          window.location.href = './login.html';
          return;
        }
        
        // Check if user is a customer
        if (!checkUserRole('customer')) {
          alert('Only customers can checkout.');
          window.location.href = './login.html';
          return;
        }
        
        // Get cart items
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if cart is empty
        if (cartItems.length === 0) {
          alert('Your cart is empty!');
          return;
        }
        
        // Proceed to checkout
        window.location.href = './checkout.html';
      } catch (error) {
        console.error('Error during checkout:', error);
      }
    });
  }
});

// USER DROPDOWN MENU
document.addEventListener('DOMContentLoaded', async () => {
  // User dropdown toggle
  const userIcon = document.getElementById('user-icon');
  const customerDropdown = document.getElementById('customer-dropdown');
  const adminSellerDropdown = document.getElementById('admin-seller-dropdown');
  const logoutBtnCustomer = document.getElementById('logout-btn-customer');
  const logoutBtnAdminSeller = document.getElementById('logout-btn-admin-seller');
  const dashboardLink = document.getElementById('dashboard-link');
  
  // Import auth functions
  const authModule = await import('./auth.js');
  const { isLoggedIn, checkUserRole } = authModule;
  
  if (userIcon) {
    // Toggle appropriate dropdown when user icon is clicked
    userIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Determine which dropdown to show based on user role
      if (isLoggedIn()) {
        if (checkUserRole('customer')) {
          if (customerDropdown) customerDropdown.classList.toggle('active');
        } else if (checkUserRole('seller') || checkUserRole('admin')) {
          if (adminSellerDropdown) adminSellerDropdown.classList.toggle('active');
        }
      }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!userIcon.contains(e.target)) {
        if (customerDropdown && !customerDropdown.contains(e.target)) {
          customerDropdown.classList.remove('active');
        }
        if (adminSellerDropdown && !adminSellerDropdown.contains(e.target)) {
          adminSellerDropdown.classList.remove('active');
        }
      }
    });
    
    // Handle customer logout button click
    if (logoutBtnCustomer) {
      logoutBtnCustomer.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          authModule.logoutUser();
        } catch (error) {
          console.error('Error during logout:', error);
        }
      });
    }
    
    // Handle admin/seller logout button click
    if (logoutBtnAdminSeller) {
      logoutBtnAdminSeller.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          authModule.logoutUser();
        } catch (error) {
          console.error('Error during logout:', error);
        }
      });
    }
    
    // Handle dashboard link click - redirect based on role
    if (dashboardLink) {
      dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (isLoggedIn()) {
          if (checkUserRole('admin')) {
            // Redirect admin to user management page
            window.location.href = '/dashboard/admin/user-manage.html';
          } else if (checkUserRole('seller')) {
            // Redirect seller to order management page
            window.location.href = '/dashboard/Seller/order-manage.html';
          }
        }
      });
    }
  }
});

// DASHBOARD SIDEBAR
const dashboardSidebar = document.getElementById('dashboard-sidebar');
const togglePanel = document.getElementById('togglePanel');

if (dashboardSidebar && togglePanel) {
  togglePanel.addEventListener('click', () => {
    dashboardSidebar.classList.toggle('expanded');
    togglePanel.classList.toggle('sidebar-expanded');
  });
}


