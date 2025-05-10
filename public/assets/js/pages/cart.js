/**
 * Cart functionality for the e-commerce site
 * Note: Most cart UI functionality is now handled directly in product-card.js
 * This file maintains the core cart functions for compatibility
 */

// Generate a unique order ID for checkout
function getOrCreateOrderId() {
  let orderId = localStorage.getItem('orderId');
  
  if (!orderId) {
    let newOrderId;
    do {
      newOrderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    } while (localStorage.getItem(newOrderId));
    
    localStorage.setItem('orderId', newOrderId);
    orderId = newOrderId;
  }

  return orderId;
}

// Update the cart count in the header UI
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const el = document.querySelector("#cart-count");
  if (el) el.textContent = totalItems;
}

// Add product to cart (exported for compatibility with other modules)
export function addToCart(product) {
  try {
    console.log("Legacy addToCart called - cart UI is now handled in product-card.js");
    
    // Add to localStorage
    addToCartLocalStorage(product);
    
    // Update cart count
    updateCartCount();
    
    // Note: We no longer need to update the sidebar here as it's handled in product-card.js
  } catch (err) {
    console.error("Error in addToCart:", err);
  }
}

// Add product to localStorage cart
export function addToCartLocalStorage(product) {
  console.log('Adding product to localStorage:', product);
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cartItems.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1; // Increment quantity if product already exists
  } else {
    cartItems.push({ ...product, quantity: 1 }); // Add new product
  }

  localStorage.setItem("cart", JSON.stringify(cartItems));
  
  // Always render the cart sidebar after adding items
  renderCartSidebar();
  
  // Update cart count
  updateCartCount();
}

// ✅ Checkout Button Logic
const checkoutBtn = document.querySelector(".checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderId = getOrCreateOrderId(); // 🔥 Get or create the orderId
    sessionStorage.setItem("cart", JSON.stringify(cartItems));
    sessionStorage.setItem("cartTotal", document.getElementById("cart-total").textContent);
    sessionStorage.setItem("orderId", orderId); // 🔥 Store the orderId for use in checkout.js

    // Navigate to checkout page
    window.location.href = "/checkout.html"; // Update with actual checkout URL
  });
}

// Function to render the cart sidebar contents
export function renderCartSidebar() {
  console.log('Rendering cart sidebar from cart.js...');
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const sidebar = document.querySelector('.cart-sidebar');
  
  if (!sidebar) {
    console.error('Cart sidebar not found in DOM');
    return;
  }
  
  const container = sidebar.querySelector('.cart-items');
  const totalEl = sidebar.querySelector('#cart-total');
  
  if (!container || !totalEl) {
    console.error('Essential cart sidebar elements not found', { container, totalEl });
    return;
  }
  
  // Check for empty cart message - if it doesn't exist, we'll create it
  let emptyMsg = sidebar.querySelector('.empty-cart-msg');
  if (!emptyMsg) {
    console.log('Creating empty cart message element');
    emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-cart-msg';
    emptyMsg.textContent = 'No items in the cart yet.';
    container.appendChild(emptyMsg);
  }
  
  // Clear previous content
  container.innerHTML = '';
  
  if (cartItems.length === 0) {
    emptyMsg.style.display = 'block';
    totalEl.textContent = '0.00';
    return;
  }
  
  // Hide empty message
  emptyMsg.style.display = 'none';
  
  // Add items to cart
  let total = 0;
  cartItems.forEach((item) => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('cart-item');
    itemDiv.setAttribute('data-id', item.id);
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
    
    container.appendChild(itemDiv);
    total += item.price * item.quantity;
  });
  
  // Add event listeners after all items are added to DOM
  cartItems.forEach((item) => {
    const itemEl = container.querySelector(`[data-id="${item.id}"]`);
    if (!itemEl) return;
    
    // Add delete functionality
    const deleteBtn = itemEl.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
        removeCartItem(item.id);
      });
    }
    
    // Add quantity control functionality
    const minusBtn = itemEl.querySelector('.quantity-btn.minus');
    const plusBtn = itemEl.querySelector('.quantity-btn.plus');
    
    if (minusBtn) {
      minusBtn.addEventListener('click', function() {
        updateCartItemQuantity(item.id, -1);
      });
    }
    
    if (plusBtn) {
      plusBtn.addEventListener('click', function() {
        updateCartItemQuantity(item.id, 1);
      });
    }
  });
  
  // Update total
  totalEl.textContent = total.toFixed(2);
  localStorage.setItem('cartTotal', total.toFixed(2));
  console.log('Cart sidebar rendered successfully');
}

// Function to remove item from cart
export function removeCartItem(itemId) {
  console.log('Removing item from cart:', itemId);
  let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  cartItems = cartItems.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(cartItems));
  renderCartSidebar();
  updateCartCount();
}

// Function to update item quantity
export function updateCartItemQuantity(itemId, change) {
  console.log('Updating item quantity:', itemId, change);
  let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cartItems.find(item => item.id === itemId);
  
  if (item) {
    item.quantity += change;
    
    if (item.quantity <= 0) {
      // Remove item if quantity is 0 or less
      return removeCartItem(itemId);
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    renderCartSidebar();
    updateCartCount();
  }
}

// Automatically render sidebar cart on page load (if sidebar exists)
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".cart-sidebar")) {
    renderCartSidebar();  // Render cart immediately on page load
    updateCartCount();  // Update cart count as soon as the page loads
  }
  
  // Add click event to cart icon to open sidebar
  const cartIcon = document.querySelector('.fa-shopping-cart');
  if (cartIcon) {
    cartIcon.addEventListener('click', () => {
      const sidebar = document.querySelector('.cart-sidebar');
      if (sidebar) {
        sidebar.classList.add('open');
        renderCartSidebar();
      }
    });
  }
  
  // Add click event to close cart button
  const closeCart = document.querySelector('.close-cart');
  if (closeCart) {
    closeCart.addEventListener('click', () => {
      const sidebar = document.querySelector('.cart-sidebar');
      if (sidebar) {
        sidebar.classList.remove('open');
      }
    });
  }
});
