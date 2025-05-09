import {
  getApprovedProduct,
  getSellerNameById,
  getAllReviewsByProductId,
  getCustomerNameById,
} from "../api.js";
import { dateFormatFromISO } from "../utility/format.js";

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
    cartBtn.addEventListener('click', () => {
      const quantity = parseInt(quantityInput.value);
      console.log(`Adding ${quantity} of product ${id} to cart`);
      // Here you would add your actual cart functionality
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
