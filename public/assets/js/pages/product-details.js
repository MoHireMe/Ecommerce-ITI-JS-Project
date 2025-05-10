import {
  getApprovedProduct,
  getSellerNameById,
  getAllReviewsByProductId,
  getCustomerNameById,
} from "../api.js";
// Import only what we need
import { dateFormatFromISO } from "../utility/format.js";

// Standalone function to update the cart UI
function updateCartUI() {
  console.log('Directly updating cart UI from product-details.js');
  
  // Get cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Get cart sidebar elements
  const sidebar = document.querySelector('.cart-sidebar');
  if (!sidebar) {
    console.error('Cart sidebar not found');
    return;
  }
  
  // Get cart elements
  const container = sidebar.querySelector('.cart-items');
  const totalEl = sidebar.querySelector('#cart-total');
  
  if (!container || !totalEl) {
    console.error('Essential cart elements not found');
    return;
  }
  
  // Clear existing cart items
  container.innerHTML = '';
  
  // Check if cart is empty
  if (cartItems.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-cart-msg';
    emptyMsg.textContent = 'No items in the cart yet.';
    container.appendChild(emptyMsg);
    totalEl.textContent = '0.00';
    return;
  }
  
  // Add items to cart
  let total = 0;
  
  cartItems.forEach(item => {
    // Create cart item element
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.setAttribute('data-id', item.id);
    
    // Set item content
    itemEl.innerHTML = `
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
    
    // Add to container
    container.appendChild(itemEl);
    
    // Update total
    total += item.price * item.quantity;
  });
  
  // Update total price
  totalEl.textContent = total.toFixed(2);
  
  // Add event listeners to buttons
  addCartItemEventListeners();
}

// Function to add event listeners to cart items
function addCartItemEventListeners() {
  const cartItems = document.querySelectorAll('.cart-item');
  
  cartItems.forEach(item => {
    const itemId = item.getAttribute('data-id');
    
    // Delete button
    const deleteBtn = item.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        removeItemFromCart(itemId);
      });
    }
    
    // Minus button
    const minusBtn = item.querySelector('.quantity-btn.minus');
    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        updateItemQuantity(itemId, -1);
      });
    }
    
    // Plus button
    const plusBtn = item.querySelector('.quantity-btn.plus');
    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        updateItemQuantity(itemId, 1);
      });
    }
  });
}

// Function to remove item from cart
function removeItemFromCart(itemId) {
  console.log('Removing item from cart:', itemId);
  
  // Get cart items
  let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Remove item
  cartItems = cartItems.filter(item => item.id !== itemId);
  
  // Update localStorage
  localStorage.setItem('cart', JSON.stringify(cartItems));
  
  // Update UI
  updateCartUI();
}

// Function to update item quantity
function updateItemQuantity(itemId, change) {
  console.log('Updating item quantity:', itemId, change);
  
  // Get cart items
  let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Find item
  const item = cartItems.find(item => item.id === itemId);
  if (!item) return;
  
  // Update quantity
  item.quantity += change;
  
  // Remove item if quantity is 0 or less
  if (item.quantity <= 0) {
    return removeItemFromCart(itemId);
  }
  
  // Update localStorage
  localStorage.setItem('cart', JSON.stringify(cartItems));
  
  // Update UI
  updateCartUI();
}

const imgTag = document.querySelector(".img-container img");
const titleTag = document.querySelector(".title");
const descriptionTag = document.querySelector(".description");
const sellerTag = document.querySelector(".seller");
const ratingsTag = document.querySelector(".total-ratings");
const starTag = document.querySelector(".star");
const catTag = document.querySelector(".cat");
const priceTag = document.querySelector(".price");
const reviewsTag = document.querySelector(".reviews-container");

const query = new URLSearchParams(window.location.search);
const pId = query.get("id");

const calculateAvgReviews = (reviews) => {
  // If there are no reviews, return 0 instead of NaN
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  
  let sum = 0;
  reviews.forEach(({ rating }) => {
    sum += Number(rating);
  });

  return sum / reviews.length;
};

const displayProductData = async ({
  id,
  image,
  name,
  description,
  sellerId,
  category,
  price,
}) => {
  // Handle missing image with a placeholder
  imgTag.src = image || './assets/images/product-placeholder.jpg';
  imgTag.alt = name || 'Product Image';
  
  // Set product name and title
  titleTag.innerText = name || 'Product Name Unavailable';
  document.title = name ? `${name} | Buy Hive` : 'Product Details | Buy Hive';
  
  // Handle missing description
  descriptionTag.innerText = description || 'No description available for this product.';

  try {
    // Get seller name with error handling
    sellerTag.innerText = await getSellerNameById(sellerId) || 'Unknown Seller';
  } catch (error) {
    console.error('Error fetching seller name:', error);
    sellerTag.innerText = 'Unknown Seller';
  }

  try {
    // Get and display reviews with error handling
    const reviews = await getAllReviewsByProductId(id);
    ratingsTag.innerText = `${reviews.length} Rating${reviews.length !== 1 ? 's' : ''}`;
    
    // Format the rating to show only one decimal place if needed
    const avgRating = calculateAvgReviews(reviews);
    starTag.innerText = `${avgRating % 1 === 0 ? avgRating : avgRating.toFixed(1)}⭐`;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    ratingsTag.innerText = '0 Ratings';
    starTag.innerText = '0⭐';
  }

  // Set category and price with fallbacks
  catTag.innerText = category || 'Uncategorized';
  priceTag.innerText = `${price || 0} EGP`;
  
  // Connect quantity selector to Add to Cart button
  const quantityInput = document.getElementById('quantity');
  const cartBtn = document.querySelector('.cart-btn');
  
  if (cartBtn && quantityInput) {
    cartBtn.addEventListener('click', async () => {
      try {
        // Import auth functions directly in the event listener
        const { isLoggedIn, checkUserRole } = await import('../auth.js');
        
        // Check if user is logged in and is a customer
        if (!isLoggedIn()) {
          alert('You need to be logged in to add items to your cart.');
          window.location.href = './login.html';
          return;
        }
        
        // Check if the logged-in user is a customer
        if (!checkUserRole('customer')) {
          alert('Only customers can add items to the cart.');
          window.location.href = './login.html';
          return;
        }
        
        // Disable button to prevent multiple clicks
        cartBtn.disabled = true;
        cartBtn.textContent = "Adding to Cart...";
        
        // Get quantity from input
        const quantity = parseInt(quantityInput.value) || 1;
        
        // Create product object with the selected quantity
        const productToAdd = {
          id: id,
          name: name,
          price: parseFloat(price),
          quantity: quantity
        };
        
        console.log('Adding product to cart with quantity:', quantity);
        
        // DIRECT CART MANIPULATION
        // Get current cart
        let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        const existing = cartItems.find(item => item.id === id);
        
        if (existing) {
          existing.quantity += quantity; // Add the selected quantity
          console.log('Updated existing item quantity to:', existing.quantity);
        } else {
          cartItems.push(productToAdd); // Add new product with quantity
          console.log('Added new item to cart');
        }
        
        // Save to localStorage
        localStorage.setItem("cart", JSON.stringify(cartItems));
        console.log('Cart saved to localStorage:', cartItems);
        
        // Update button text for feedback
        cartBtn.textContent = "Added to Cart!";
        
        // Open the cart sidebar
        const sidebar = document.querySelector(".cart-sidebar");
        if (sidebar) {
          sidebar.classList.add("open");
          
          // Update cart UI using our standalone function
          updateCartUI();
        }
        
        // Reset button after delay
        setTimeout(() => {
          cartBtn.disabled = false;
          cartBtn.textContent = "Add to Cart";
        }, 1500);
        
      } catch (err) {
        console.error("Error adding to cart:", err);
        cartBtn.textContent = "Error!";
        
        setTimeout(() => {
          cartBtn.disabled = false;
          cartBtn.textContent = "Add to Cart";
        }, 1500);
      }
    });
  }
};

const displayCommentSection = async (reviews) => {
  // Clear existing reviews first
  reviewsTag.innerHTML = '<h2>Customer Reviews</h2>';
  
  // Check if reviews exist and have length
  if (!reviews || reviews.length === 0) {
    // Display a message when there are no reviews
    const noReviewsMsg = document.createElement('div');
    noReviewsMsg.classList.add('no-reviews-message');
    noReviewsMsg.innerHTML = `
      <p>There are no reviews yet for this product.</p>
      <p>Be the first to share your experience!</p>
    `;
    reviewsTag.appendChild(noReviewsMsg);
    return;
  }
  
  // Use Promise.all to properly handle async operations in the loop
  const reviewPromises = reviews.map(async ({ userId, rating, comment, createdAt }) => {
    try {
      const customerName = await getCustomerNameById(userId);
      const reviewDiv = document.createElement('div');
      reviewDiv.classList.add('review-container');
      
      reviewDiv.innerHTML = `
        <h3 class="user-info">${customerName || 'Anonymous User'}</h3>
        <span class="review-date">${dateFormatFromISO(createdAt)}</span>
        <span class="review-star">${rating}⭐</span>
        <p class="review-comment">${comment || 'No comment provided.'}</p>`;
      
      return reviewDiv;
    } catch (error) {
      console.error('Error creating review element:', error);
      // Return a simplified review element if there's an error
      const errorReviewDiv = document.createElement('div');
      errorReviewDiv.classList.add('review-container');
      errorReviewDiv.innerHTML = `
        <h3 class="user-info">Anonymous User</h3>
        <span class="review-date">${dateFormatFromISO(createdAt)}</span>
        <span class="review-star">${rating}⭐</span>
        <p class="review-comment">${comment || 'No comment provided.'}</p>`;
      
      return errorReviewDiv;
    }
  });
  
  // Wait for all review elements to be created, then append them to the container
  const reviewElements = await Promise.all(reviewPromises);
  reviewElements.forEach(element => reviewsTag.appendChild(element));
};

// Add CSS for the no-reviews-message
const style = document.createElement('style');
style.textContent = `
  .no-reviews-message {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    color: #666;
    margin: 20px 0;
  }
  .no-reviews-message p {
    margin: 10px 0;
  }
  .error-container {
    background-color: #fff8f8;
    border: 1px solid #ffebee;
    border-radius: 8px;
    padding: 20px;
    margin: 40px auto;
    max-width: 600px;
    text-align: center;
  }
  .error-container h2 {
    color: #e53935;
    margin-bottom: 15px;
  }
  .error-container p {
    color: #555;
    margin-bottom: 20px;
  }
  .error-container button {
    background-color: #00c875;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .error-container button:hover {
    background-color: #00a65a;
  }
`;
document.head.appendChild(style);

// Main execution
async function initProductDetails() {
  try {
    // Check if product ID exists in URL
    if (!pId) {
      throw new Error('No product ID provided');
    }
    
    // Get product data
    let product = await getApprovedProduct(pId);
    await displayProductData(product);

    // Get and display reviews
    try {
      const reviews = await getAllReviewsByProductId(product.id);
      await displayCommentSection(reviews);
    } catch (reviewErr) {
      console.error('Error loading reviews:', reviewErr);
      // Still display the product, but show a message about review loading failure
      reviewsTag.innerHTML = '<h2>Customer Reviews</h2><p>Unable to load reviews at this time.</p>';
    }
    
  } catch (err) {
    console.error('Error loading product details:', err);
    
    // Create a user-friendly error display instead of an alert
    document.querySelector('.main-container').innerHTML = `
      <div class="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>${err.message || 'Unable to load product details'}</p>
        <p>The product you're looking for might not exist or there was an error loading it.</p>
        <button id="go-back-btn">Go Back to Shopping</button>
      </div>
    `;
    
    // Add event listener to the back button
    document.getElementById('go-back-btn').addEventListener('click', () => {
      window.location.href = './product-list.html';
    });
  }
}

// Initialize the product details page
initProductDetails();

// Initialize cart count and sidebar when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Update cart count
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const countEl = document.querySelector("#cart-count");
  if (countEl) countEl.textContent = totalItems;
  
  // Initialize quantity selector buttons
  const quantityInput = document.getElementById('quantity');
  const minusBtn = document.querySelector('.quantity-controls .minus');
  const plusBtn = document.querySelector('.quantity-controls .plus');
  
  if (minusBtn && plusBtn && quantityInput) {
    minusBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
    
    plusBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
    });
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
  
  // Add click event to checkout button
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      // Navigate to checkout page
      window.location.href = '/checkout.html';
    });
  }
});
