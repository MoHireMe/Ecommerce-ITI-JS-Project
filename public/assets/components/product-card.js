const getProductCard = (imgSrc, title, stars, price, cat, pid) => {
  // Create the main card container
  const card = document.createElement("div");
  card.classList.add("product-card-container");
  card.setAttribute("data-id", pid);
  card.setAttribute("data-category", cat); // Add category as data attribute for filtering
  
  // Format price to 2 decimal places
  const formattedPrice = parseFloat(price).toFixed(2);
  
  // Build the card HTML structure
  card.innerHTML = `
    <img src="${imgSrc}" alt="${title.split(" ").join("-").toLowerCase()}" />
    <div class="content">
      <h3 class="title">${title}</h3>
      <div class="stars">
        <span class="cat">${cat}</span>
        <span class="star">${stars}</span>
      </div>
      <div class="lower-section">
        <p class="price">$${formattedPrice}</p>
        <button data-pid="${pid}" class="add-to-cart">Add to Cart</button>
      </div>
    </div>`;
  
  // Add click event to navigate to product detail page
  card.querySelector('img').addEventListener('click', () => {
    window.location.href = `./product-details.html?id=${pid}`;
  });
  
  card.querySelector('.title').addEventListener('click', () => {
    window.location.href = `./product-details.html?id=${pid}`;
  });
  
  // Add click event for add to cart button
  card.querySelector('.add-to-cart').addEventListener('click', (e) => {
    e.stopPropagation();
    // Here you would add your cart functionality
    console.log(`Added product ${pid} to cart`);
    // Show a quick feedback animation
    const button = e.target;
    button.textContent = "Added!";
    setTimeout(() => {
      button.textContent = "Add to Cart";
    }, 1500);
  });
  
  return card;
};

export default getProductCard;
