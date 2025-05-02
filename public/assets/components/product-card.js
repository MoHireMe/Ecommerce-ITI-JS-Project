const getProductCard = (imgSrc, title, stars, price, cat, pid) => {
  const card = document.createElement("div");
  card.classList.add("product-card-container");
  card.innerHTML = `
    <img src="${imgSrc}" alt="${title.split(" ").join("-").toLowerCase()}" />
    <h3 class="title">${title}</h3>
    <div class="stars">
    <span class="cat">${cat}</span>
      <span class="star">⭐${stars}</span>
    </div>
    <div class="lower-section">
      <p class="price">$${price}</p>
      <button data-pid="${pid}" class="add-to-cart">Add to Cart</button>
    </div>`;
  return card;
};

export default getProductCard;
