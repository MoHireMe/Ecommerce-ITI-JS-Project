import { submitOrder } from '../api.js';
import { getCurrentUser } from '../auth.js';
document.addEventListener("DOMContentLoaded", () => {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const cartTotal = localStorage.getItem('cartTotal') || '0.00';
  const customerId = getCurrentUser().id;  // Must be set during login

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
      <span>${item.name} <strong>x${item.quantity}</strong></span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    `;
    checkoutItems.appendChild(div);
  });

  checkoutTotal.textContent = cartTotal;

  // Confirm Order Button Logic
  confirmBtn.addEventListener('click', async () => {
    try {
      // Disable button and show loading state
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Processing...';
      confirmBtn.style.opacity = '0.7';
      
      if (!customerId) {
        showNotification("You must be logged in to place an order.", "error");
        resetButton();
        return;
      }

      const order = {
        customerId,
        products: cartItems,
        total: parseFloat(cartTotal),
        date: new Date().toISOString()
      };

      const res = await submitOrder(order);

      if (!res.ok) throw new Error('Order submission failed');

      // Save order to sessionStorage for thank-you.html
      sessionStorage.setItem('lastOrderSummary', JSON.stringify(order));

      // Clear localStorage cart after order success
      localStorage.removeItem('cart');
      localStorage.removeItem('cartTotal');
      localStorage.removeItem('orderId');

      // Show success animation before redirecting
      showNotification("Order confirmed! Redirecting to confirmation page...", "success");
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        window.location.href = '/thank-you.html';
      }, 1500);
      
    } catch (err) {
      console.error("Checkout error:", err);
      showNotification('Something went wrong. Please try again.', 'error');
      resetButton();
    }
  });
  
  // Helper function to reset button state
  function resetButton() {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Order';
    confirmBtn.style.opacity = '1';
  }
  
  // Helper function to show notifications
  function showNotification(message, type) {
    // Check if notification container exists, if not create it
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.classList.add('notification-container');
      document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
        if (notificationContainer.children.length === 0) {
          notificationContainer.remove();
        }
      }, 300);
    }, 3000);
  }
});
