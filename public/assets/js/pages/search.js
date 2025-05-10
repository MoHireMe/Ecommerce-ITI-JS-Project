import getProductCard from '../../components/product-card.js';
import { getAllApprovedProducts } from '../api.js';

async function searchProducts() {
  const searchInput = document.querySelector(".nav-search input");
  const searchQuery = searchInput.value.toLowerCase().trim();
  console.log("Search query:", searchQuery); // Debugging the search query

  if (searchQuery === "") {
    return; // Do nothing if search query is empty
  }

  try {
    // Fetch filtered products using search query
    const products = await getAllApprovedProducts(searchQuery); 
    console.log("Filtered products:", products); // Debug filtered products

    // Display the filtered products
    displayProducts(products); // Ensure products are passed correctly to this function

  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function displayProducts(products) {
  const productContainer = document.querySelector(".product-list-container");
  productContainer.innerHTML = ''; // Clear previous results

  if (!products || products.length === 0) {
    productContainer.innerHTML = "<p>No products found.</p>";
  } else {
    products.forEach(product => {
  console.log("Product details:", product); // Debugging product object

  const productCard = getProductCard(
    product.imgSrc,
    product.title,
    product.stars,
    product.price,
    product.cat,
    product.pid
  );
  productContainer.appendChild(productCard);
});
  }
}

// Event listener for search functionality
document.querySelector(".nav-search input").addEventListener("keyup", searchProducts);
