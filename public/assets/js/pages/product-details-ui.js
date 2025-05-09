// Product details UI functionality

document.addEventListener('DOMContentLoaded', () => {
  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button and corresponding pane
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Quantity selector functionality
  const quantityInput = document.getElementById('quantity');
  const minusBtn = document.querySelector('.quantity-btn.minus');
  const plusBtn = document.querySelector('.quantity-btn.plus');

  if (quantityInput && minusBtn && plusBtn) {
    minusBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });

    plusBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue < 10) {
        quantityInput.value = currentValue + 1;
      }
    });

    // Prevent manual input of invalid values
    quantityInput.addEventListener('change', () => {
      let value = parseInt(quantityInput.value);
      if (isNaN(value) || value < 1) {
        value = 1;
      } else if (value > 10) {
        value = 10;
      }
      quantityInput.value = value;
    });
  }

  // Wishlist button functionality
  const wishlistBtn = document.querySelector('.wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      const icon = wishlistBtn.querySelector('i');
      if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        wishlistBtn.style.backgroundColor = '#ffebee';
        wishlistBtn.style.color = '#ff5252';
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        wishlistBtn.style.backgroundColor = '#f5f5f5';
        wishlistBtn.style.color = '#333';
      }
    });
  }

  // Add to cart button animation
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      const originalText = cartBtn.innerHTML;
      cartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
      cartBtn.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        cartBtn.innerHTML = originalText;
        cartBtn.style.backgroundColor = '#00c875';
      }, 2000);
    });
  }
});
