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
      const product = {
        id: pid,
        name: productTitle,
        price: parseFloat(price)
      };

      await addToCart(product);

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

  return card;
};


export default getProductCard;

