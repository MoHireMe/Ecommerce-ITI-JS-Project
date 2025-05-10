import { addToCart } from '../js/pages/cart.js';  // Import the addToCart function

const getProductCard = (imgSrc, title, stars, price, cat, pid) => {
  const card = document.createElement("div");
  card.classList.add("product-card-container");
  card.setAttribute("data-id", pid);
  card.setAttribute("data-category", cat);

  const formattedPrice = parseFloat(price).toFixed(2);

  // Ensure title is valid
  const productTitle = title || "Untitled Product"; // Fallback if title is undefined
  const imageSrc = imgSrc || '/default-image.jpg'; // Fallback if image is missing

  card.innerHTML = `
    <img src="${imageSrc}" alt="${productTitle.split(" ").join("-").toLowerCase()}" />
    <div class="content">
      <h3 class="title">${productTitle}</h3>
      <div class="stars">
        <span class="cat">${cat}</span>
        <span class="star">${stars}</span>
      </div>
      <div class="lower-section">
        <p class="price">$${formattedPrice}</p>
        <button data-pid="${pid}" class="add-to-cart">Add to Cart</button>
      </div>
    </div>`;

  // Navigate to product details on image/title click
  card.querySelector('img').addEventListener('click', () => {
    window.location.href = `./product-details.html?id=${pid}`;
  });

  card.querySelector('.title').addEventListener('click', () => {
    window.location.href = `./product-details.html?id=${pid}`;
  });

  // Add to cart button logic
  card.querySelector('.add-to-cart').addEventListener('click', async (e) => {
    e.stopPropagation();

    const button = e.target;
    button.disabled = true;
    button.textContent = "Adding...";

    try {
      // Import auth functions directly in the event listener
      const { isLoggedIn, checkUserRole } = await import('../js/auth.js');
      
      // Check if user is logged in and is a customer
      if (!isLoggedIn()) {
        button.textContent = "Login Required";
        setTimeout(() => {
          button.textContent = "Add to Cart";
          button.disabled = false;
        }, 1000);
        
        alert('You need to be logged in to add items to your cart.');
        window.location.href = './login.html';
        return;
      }
      
      // Check if the logged-in user is a customer
      if (!checkUserRole('customer')) {
        button.textContent = "Customer Only";
        setTimeout(() => {
          button.textContent = "Add to Cart";
          button.disabled = false;
        }, 1000);
        
        alert('Only customers can add items to the cart.');
        window.location.href = './login.html';
        return;
      }

      const product = {
        id: pid,
        name: productTitle,
        price: parseFloat(price)
      };

      // Direct cart manipulation
      await addProductToCart(product);
      
      // Visual feedback
      button.textContent = "Added!";
      setTimeout(() => {
        button.textContent = "Add to Cart";
        button.disabled = false;
      }, 1500);
    } catch (err) {
      console.error("Error adding product to cart:", err);
      button.textContent = "Error!";
      setTimeout(() => {
        button.textContent = "Add to Cart";
        button.disabled = false;
      }, 1500);
    }
  });

  // Function to update item quantity
  function updateItemQuantity(itemId, change) {
    try {
      // Get current cart items
      let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      
      // Find the item to update
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;
      
      // Update quantity (minimum 1)
      item.quantity = Math.max(1, item.quantity + change);
      
      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems));
      
      // Update cart count
      const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      const countEl = document.querySelector("#cart-count");
      if (countEl) countEl.textContent = totalItems;
      
      // Update cart sidebar
      const sidebar = document.querySelector(".cart-sidebar");
      if (sidebar) {
        // Update sidebar contents
        const container = sidebar.querySelector(".cart-items");
        const totalEl = sidebar.querySelector("#cart-total");
        const emptyMsg = sidebar.querySelector(".empty-cart-msg");
        
        if (container && totalEl) {
          // Clear previous content
          container.innerHTML = "";
          
          if (cartItems.length === 0) {
            if (emptyMsg) emptyMsg.style.display = "block";
            totalEl.textContent = "0.00";
            return;
          }
          
          // Hide empty message
          if (emptyMsg) emptyMsg.style.display = "none";
          
          // Add items to cart
          let total = 0;
          cartItems.forEach((item) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");
            itemDiv.setAttribute("data-id", item.id);
            itemDiv.innerHTML = `
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
            
            // Add delete functionality
            const deleteBtn = itemDiv.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              const itemId = this.getAttribute('data-id');
              removeFromCart(itemId);
            });
            
            // Add quantity control functionality
            const minusBtn = itemDiv.querySelector('.quantity-btn.minus');
            const plusBtn = itemDiv.querySelector('.quantity-btn.plus');
            
            minusBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              const itemId = this.getAttribute('data-id');
              updateItemQuantity(itemId, -1); // Decrease quantity by 1
            });
            
            plusBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              const itemId = this.getAttribute('data-id');
              updateItemQuantity(itemId, 1); // Increase quantity by 1
            });
            
            container.appendChild(itemDiv);
            total += item.price * item.quantity;
          });
          
          // Update total
          totalEl.textContent = total.toFixed(2);
          localStorage.setItem("cartTotal", total.toFixed(2));
        }
      }
      
      console.log(`Item ${itemId} quantity updated to ${item.quantity}`);
    } catch (err) {
      console.error("Error updating item quantity:", err);
    }
  }
  
  // Function to remove item from cart
  function removeFromCart(itemId) {
    try {
      // Get current cart items
      let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      
      // Filter out the item to remove
      cartItems = cartItems.filter(item => item.id !== itemId);
      
      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems));
      
      // Update cart count
      const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      const countEl = document.querySelector("#cart-count");
      if (countEl) countEl.textContent = totalItems;
      
      // Update cart sidebar
      const sidebar = document.querySelector(".cart-sidebar");
      if (sidebar) {
        // Update sidebar contents
        const container = sidebar.querySelector(".cart-items");
        const totalEl = sidebar.querySelector("#cart-total");
        const emptyMsg = sidebar.querySelector(".empty-cart-msg");
        
        if (container && totalEl) {
          // Clear previous content
          container.innerHTML = "";
          
          if (cartItems.length === 0) {
            if (emptyMsg) emptyMsg.style.display = "block";
            totalEl.textContent = "0.00";
            return;
          }
          
          // Hide empty message
          if (emptyMsg) emptyMsg.style.display = "none";
          
          // Add items to cart
          let total = 0;
          cartItems.forEach((item) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");
            itemDiv.setAttribute("data-id", item.id);
            itemDiv.innerHTML = `
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
            
            // Add delete functionality
            const deleteBtn = itemDiv.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              const itemId = this.getAttribute('data-id');
              removeFromCart(itemId);
            });
            
            container.appendChild(itemDiv);
            total += item.price * item.quantity;
          });
          
          // Update total
          totalEl.textContent = total.toFixed(2);
          localStorage.setItem("cartTotal", total.toFixed(2));
        }
      }
      
      console.log("Item removed from cart:", itemId);
    } catch (err) {
      console.error("Error removing item from cart:", err);
    }
  }
  
  // Direct implementation of cart functionality
  async function addProductToCart(product) {
    try {
      console.log("Direct adding product to cart:", product);
      
      // Add to localStorage
      let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cartItems.find((item) => item.id === product.id);
      
      if (existing) {
        existing.quantity += 1; // Increment quantity if product already exists
      } else {
        cartItems.push({ ...product, quantity: 1 }); // Add new product
      }
      
      localStorage.setItem("cart", JSON.stringify(cartItems));
      
      // Update cart count
      const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      const countEl = document.querySelector("#cart-count");
      if (countEl) countEl.textContent = totalItems;
      
      // Open sidebar
      const sidebar = document.querySelector(".cart-sidebar");
      if (sidebar) {
        sidebar.classList.add("open");
        
        // Update sidebar contents
        const container = sidebar.querySelector(".cart-items");
        const totalEl = sidebar.querySelector("#cart-total");
        const emptyMsg = sidebar.querySelector(".empty-cart-msg");
        
        if (container && totalEl) {
          // Clear previous content
          container.innerHTML = "";
          
          if (cartItems.length === 0) {
            if (emptyMsg) emptyMsg.style.display = "block";
            totalEl.textContent = "0.00";
            return;
          }
          
          // Hide empty message
          if (emptyMsg) emptyMsg.style.display = "none";
          
          // Add items to cart
          let total = 0;
          cartItems.forEach((item) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");
            itemDiv.setAttribute("data-id", item.id);
            itemDiv.innerHTML = `
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
            
            // Add delete functionality
            const deleteBtn = itemDiv.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              const itemId = this.getAttribute('data-id');
              removeFromCart(itemId);
            });
            container.appendChild(itemDiv);
            total += item.price * item.quantity;
          });
          
          // Update total
          totalEl.textContent = total.toFixed(2);
          localStorage.setItem("cartTotal", total.toFixed(2));
        }
      }
      
      // We no longer need to call the imported addToCart since we're handling everything directly
      // This was causing items to be added twice
      
    } catch (err) {
      console.error("Error in direct cart manipulation:", err);
      throw err;
    }
  }

  return card;
};

export default getProductCard;

