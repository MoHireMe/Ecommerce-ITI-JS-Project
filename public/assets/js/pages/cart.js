function getOrCreateOrderId() {
  let orderId = localStorage.getItem('orderId');
  
  // Check if an orderId already exists in localStorage
  if (!orderId) {
    let newOrderId;
    
    // Generate a unique orderId
    do {
      newOrderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    } while (localStorage.getItem(newOrderId));  // Keep generating until unique
    
    // Set the unique orderId in localStorage
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

// 🔥 MAIN FUNCTION TO CALL FROM OUTSIDE (UI -> LocalStorage only)
export function addToCart(product) {
  try {
    console.log("Adding product to cart:", product); // Log to verify the product being added

    addToCartLocalStorage(product); // Add product to localStorage
    updateCartCount();  // Update cart count in the header UI

    // Open sidebar if it exists
    const sidebar = document.querySelector(".cart-sidebar");
    if (sidebar) {
      sidebar.classList.add("open");
    }

    // Render the cart sidebar immediately after adding a product
    renderCartSidebar(); // Immediate render after adding to cart

  } catch (err) {
    console.error("Error in addToCart:", err);
    alert("Error adding product to cart.");
  }
}

// 📦 Add product to localStorage cart
export function addToCartLocalStorage(product) {
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  console.log("Current cart items:", cartItems); // Log the cart contents

  const existing = cartItems.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1; // Increment quantity if product already exists in cart
  } else {
    cartItems.push({ ...product, quantity: 1 }); // Add new product to cart
  }

  localStorage.setItem("cart", JSON.stringify(cartItems)); // Save updated cart to localStorage
  console.log("Updated cart items:", cartItems); // Log the updated cart
}

// ✅ Render the entire cart sidebar
function renderCartSidebar() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.querySelector(".cart-items");
  const totalEl = document.getElementById("cart-total");
  const emptyMsg = document.querySelector(".empty-cart-msg");

  if (!container || !totalEl || !emptyMsg) return; // Safeguard if sidebar not present

  container.innerHTML = ""; // Clear old content

  if (cartItems.length === 0) {
    emptyMsg.style.display = "block";
    totalEl.textContent = "0.00"; // Show 0.00 if cart is empty
    return;
  }

  emptyMsg.style.display = "none"; // Hide empty cart message when cart has items

  let total = 0;
  cartItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");
    itemDiv.setAttribute("data-id", item.id);
    itemDiv.innerHTML = `
      <div><strong>${item.name}</strong> <span class="item-quantity">x${item.quantity}</span></div>
      <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
    `;
    container.appendChild(itemDiv);
    total += item.price * item.quantity;
  });

  totalEl.textContent = total.toFixed(2); // Display total price
  localStorage.setItem("cartTotal", total.toFixed(2)); // 🔥 Save total to localStorage too
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
