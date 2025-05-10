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
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cartItems.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1; // Increment quantity if product already exists
  } else {
    cartItems.push({ ...product, quantity: 1 }); // Add new product
  }

  localStorage.setItem("cart", JSON.stringify(cartItems));
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

// Automatically render sidebar cart on page load (if sidebar exists)
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".cart-sidebar")) {
    renderCartSidebar();  // Render cart immediately on page load
    updateCartCount();  // Update cart count as soon as the page loads
  }
});
