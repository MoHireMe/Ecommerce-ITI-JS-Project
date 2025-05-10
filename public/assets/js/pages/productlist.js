import getProductCard from "../../components/product-card.js";
import { getAllApprovedProducts } from "../api.js";

// Global variables for pagination
let allProducts = [];
let currentProducts = [];
let currentPage = 1;
let productsPerPage = 9; // Updated to show 9 products per page (3 rows of 3)
let currentCategory = 'all';

// Helper function to create pagination buttons
const createPaginationButton = (text, clickHandler) => {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add('pagination-button');
  button.addEventListener('click', clickHandler);
  return button;
};

// Function to display products with pagination
const displayProducts = () => {
  const productGrid = document.getElementById('product-grid');
  const paginationContainer = document.querySelector('.pagination-container');
  
  if (!productGrid || !paginationContainer) return;
  
  // Clear previous content
  productGrid.innerHTML = '';
  paginationContainer.innerHTML = '';
  
  // Calculate pagination
  const totalPages = Math.ceil(currentProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, currentProducts.length);
  
  // Display message if no products match the filter
  if (currentProducts.length === 0) {
    productGrid.innerHTML = `<div class="no-products">No products found in the "${currentCategory}" category.</div>`;
    return;
  }
  
  // Add products for current page
  for (let i = startIndex; i < endIndex; i++) {
    const { id, name, price, image, category } = currentProducts[i];
    const card = getProductCard(image, name, 5, price, category, id);
    productGrid.appendChild(card);
  }
  
  // Create pagination controls if more than one page
  if (totalPages > 1) {
    // Create pagination info
    const paginationInfo = document.createElement('div');
    paginationInfo.classList.add('pagination-info');
    paginationInfo.textContent = `Page ${currentPage} of ${totalPages} (${currentProducts.length} products)`;
    paginationContainer.appendChild(paginationInfo);
    
    // Create pagination buttons container
    const paginationButtons = document.createElement('div');
    paginationButtons.classList.add('pagination-buttons');
    
    // Previous button
    if (currentPage > 1) {
      const prevButton = createPaginationButton('Prev', () => {
        currentPage--;
        displayProducts();
      });
      paginationButtons.appendChild(prevButton);
    }
    
    // Page number buttons
    const maxButtons = 5; // Maximum number of page buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxButtons && startPage > 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = createPaginationButton(i.toString(), () => {
        currentPage = i;
        displayProducts();
      });
      
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      
      paginationButtons.appendChild(pageButton);
    }
    
    // Next button
    if (currentPage < totalPages) {
      const nextButton = createPaginationButton('Next', () => {
        currentPage++;
        displayProducts();
      });
      paginationButtons.appendChild(nextButton);
    }
    
    paginationContainer.appendChild(paginationButtons);
  }
};

// Function to filter products by category and display them
const filterAndDisplayProducts = () => {
  // Filter products by selected category
  if (currentCategory === 'all') {
    currentProducts = [...allProducts];
  } else {
    currentProducts = allProducts.filter(product => 
      product.category.toLowerCase() === currentCategory.toLowerCase()
    );
  }
  
  // Display the current page of products
  displayProducts();
};

// Function to add category filter dropdown
const addCategoryFilter = (container, products) => {
  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];
  
  // Create filter container
  const filterContainer = document.createElement('div');
  filterContainer.classList.add('filter-container');
  
  // Add title
  const filterLabel = document.createElement('label');
  filterLabel.textContent = 'Filter by Category: ';
  filterLabel.setAttribute('for', 'category-filter');
  filterContainer.appendChild(filterLabel);
  
  // Create dropdown
  const dropdown = document.createElement('select');
  dropdown.id = 'category-filter';
  dropdown.classList.add('category-dropdown');
  
  // Add 'All' option
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  dropdown.appendChild(allOption);
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    dropdown.appendChild(option);
  });
  
  // Add event listener
  dropdown.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    currentPage = 1; // Reset to first page when changing category
    
    // Update URL with the selected category
    updateUrlWithCategory(currentCategory);
    
    filterAndDisplayProducts();
  });
  
  filterContainer.appendChild(dropdown);
  container.appendChild(filterContainer);
};

// Function to add search input field to the navbar
const initNavbarSearch = () => {
  const searchInput = document.getElementById('nav-search-input');
  const searchButton = document.getElementById('search-btn');
  
  if (!searchInput || !searchButton) return;

  // Event listener for the search button
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    searchProducts(query); // Call searchProducts when search button is clicked
  });

  // Event listener for the input field to trigger search on pressing Enter
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    searchProducts(query); // Call searchProducts when user types
  });
};

// Updated searchProducts to filter by category as well
const searchProducts = (query) => {
  // Filter products based on the search query and current category
  if (query === '') {
    // If no search query, show products in the selected category
    filterAndDisplayProducts(); // Filter by category
  } else {
    const filteredProducts = allProducts.filter(product => {
      const matchesCategory = currentCategory === 'all' || product.category.toLowerCase() === currentCategory.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSearch;  // Filter based on both category and search query
    });
    
    // Update currentProducts to match the filtered products
    currentProducts = filteredProducts;

    // Reset to the first page when searching
    currentPage = 1;

    // Display the filtered products
    displayProducts();
  }
};

// Function to initialize the product list
const initProductList = async () => {
  // Get the container from the HTML
  const productListContainer = document.querySelector('.product-list-container');
  
  if (!productListContainer) {
    console.error('Product list container not found in the HTML');
    return;
  }
  
  // Add a loading indicator
  productListContainer.innerHTML = '<div class="loading">Loading products...</div>';
  
  try {
    // Fetch all approved products
    allProducts = await getAllApprovedProducts();
    
    // Clear the loading indicator
    productListContainer.innerHTML = '';
    
    if (allProducts.length === 0) {
      productListContainer.innerHTML = '<div class="no-products">No products available at the moment.</div>';
      return;
    }
    
    // Add search bar to the container
    initNavbarSearch(); // Initialize navbar search
    
    // Create controls container (filter and pagination)
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('controls-container');
    
    // Add category filter dropdown
    addCategoryFilter(controlsContainer, allProducts);
    
    // Add controls container to the main container
    productListContainer.appendChild(controlsContainer);
    
    // Create a grid container for the products
    const productGrid = document.createElement('div');
    productGrid.classList.add('product-grid');
    productGrid.id = 'product-grid';
    productListContainer.appendChild(productGrid);
    
    // Add pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    productListContainer.appendChild(paginationContainer);
    
    // Check if a category filter is active from URL
    if (currentCategory !== 'all') {
      // Filter products by the category from URL
      currentProducts = allProducts.filter(product => 
        product.category.toLowerCase() === currentCategory.toLowerCase()
      );
    } else {
      // Initialize with all products if no category filter
      currentProducts = [...allProducts];
    }
    
    // Display the filtered products
    displayProducts();
    
    // Update the dropdown to match the current category
    const categoryDropdown = document.getElementById('category-filter');
    if (categoryDropdown && currentCategory !== 'all') {
      categoryDropdown.value = currentCategory;
    }
    
  } catch (err) {
    console.error('Error loading products:', err);
    productListContainer.innerHTML = `<div class="error">Error loading products: ${err.message}</div>`;
  }
};

// Function to update the URL with the selected category
const updateUrlWithCategory = (category) => {
  // Create a new URL object based on the current URL
  const url = new URL(window.location.href);
  
  // If category is 'all', remove the category parameter
  if (category === 'all') {
    url.searchParams.delete('category');
  } else {
    // Otherwise, set the category parameter
    url.searchParams.set('category', category);
  }
  
  // Update the URL without reloading the page
  window.history.pushState({ category }, '', url.toString());
};

// Function to check for category parameter in URL and set the filter accordingly
const checkUrlForCategory = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  if (categoryParam) {
    // Set the current category from URL parameter
    currentCategory = categoryParam;
    
    // After the product list is initialized, set the dropdown to match the category
    setTimeout(() => {
      const categoryDropdown = document.getElementById('category-filter');
      if (categoryDropdown) {
        // Find the option with matching category value
        const options = Array.from(categoryDropdown.options);
        const matchingOption = options.find(option => 
          option.value.toLowerCase() === categoryParam.toLowerCase()
        );
        
        // If a matching option is found, select it
        if (matchingOption) {
          categoryDropdown.value = matchingOption.value;
        }
      }
    }, 100); // Small delay to ensure the dropdown is created
  }
};

// Initialize the product list when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check for category parameter in URL
  checkUrlForCategory();
  
  // Initialize the product list
  initProductList();
});
