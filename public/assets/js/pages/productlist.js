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
    filterAndDisplayProducts();
  });
  
  filterContainer.appendChild(dropdown);
  container.appendChild(filterContainer);
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
    
    // Initialize with all products
    currentProducts = [...allProducts];
    displayProducts();
    
  } catch (err) {
    console.error('Error loading products:', err);
    productListContainer.innerHTML = `<div class="error">Error loading products: ${err.message}</div>`;
  }
};

// Initialize the product list when the DOM is loaded
document.addEventListener('DOMContentLoaded', initProductList);

