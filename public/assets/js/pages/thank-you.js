document.addEventListener('DOMContentLoaded', () => {
  const orderSummary = JSON.parse(sessionStorage.getItem('lastOrderSummary'));

  if (!orderSummary) {
    document.body.innerHTML = '<p>Order details not found. Please return to the shop and try again.</p>';
    return;
  }

  const { products, total, date } = orderSummary;

  // Generate a simple order number based on date (optional)
  const orderNumber = `ORD-${new Date(date).getTime()}`;

  // Populate the order number and items
  document.getElementById('order-number').textContent = orderNumber;

  const orderItemsContainer = document.getElementById('order-items');
  products.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('order-item');
    itemDiv.innerHTML = `
      <span>${item.name} x${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    `;
    orderItemsContainer.appendChild(itemDiv);
  });

  // Populate the total
  document.getElementById('order-total').textContent = `$${parseFloat(total).toFixed(2)}`;

  // Clear the order summary from sessionStorage
  sessionStorage.removeItem('lastOrderSummary');
});
