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

// Open cart sidebar and render contents
cartIcon.addEventListener("click", () => {
  cartSidebar.classList.add("open");
  renderCartContents(); // Render cart contents when sidebar is opened
});

closeCart.addEventListener("click", () => {
  cartSidebar.classList.remove("open");
});

// DASHBOARD SIDEBAR
const dashboardSidebar = document.getElementById('dashboard-sidebar');
const togglePanel = document.getElementById('togglePanel');

togglePanel.addEventListener('click', () => {
  dashboardSidebar.classList.toggle('expanded');
  togglePanel.classList.toggle('sidebar-expanded');
});








