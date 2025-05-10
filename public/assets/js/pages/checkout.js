import { submitOrder } from '../api.js';

document.addEventListener("DOMContentLoaded", () => {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const cartTotal = localStorage.getItem('cartTotal') || '0.00';
  const customerId = sessionStorage.getItem('customerId');  // Must be set during login

  const checkoutItems = document.getElementById('checkout-items');
  const checkoutTotal = document.getElementById('checkout-total');
  const confirmBtn = document.getElementById('confirm-order-btn');

  if (cartItems.length === 0) {
    checkoutItems.innerHTML = '<p>Your cart is empty.</p>';
    confirmBtn.disabled = true;
    return;
  }

  // Render cart items in checkout UI
  cartItems.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('checkout-item');
    div.innerHTML = ` 
      <span>${item.name} x${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    `;
    checkoutItems.appendChild(div);
  });

  checkoutTotal.textContent = cartTotal;

  // Confirm Order Button Logic
  confirmBtn.addEventListener('click', async () => {
    try {
      if (!customerId) {
        alert("You must be logged in to place an order.");
        return;
      }

      const order = {
        customerId,
        products: cartItems,
        total: parseFloat(cartTotal),
        date: new Date().toISOString()  // Optional: add timestamp
      };

      const res = await submitOrder(order);

      if (!res.ok) throw new Error('Order submission failed');

      alert('Order confirmed!');

      // Save order to sessionStorage for thank-you.html
      sessionStorage.setItem('lastOrderSummary', JSON.stringify(order));

      // Clear localStorage cart after order success
      localStorage.removeItem('cart');
      localStorage.removeItem('cartTotal');
      localStorage.removeItem('orderId');  // Optional: clear generated order ID

      window.location.href = '/thank-you.html';
    } catch (err) {
      console.error("Checkout error:", err);
      alert('Something went wrong. Please try again.');
    }
  });
});
