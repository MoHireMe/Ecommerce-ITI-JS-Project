const menuBtn = document.querySelector(".mobile-menu-button");
const sidebar = document.querySelector(".sidebar");
const closeBtn = document.querySelector(".close-btn");

menuBtn.addEventListener("click", () => {
  sidebar.classList.add("active");
});

closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
});

const cartIcon = document.querySelector(".fa-shopping-cart");
  const cartSidebar = document.querySelector(".cart-sidebar");
  const closeCart = document.querySelector(".close-cart");

  cartIcon.addEventListener("click", () => {
    cartSidebar.classList.add("open");
  });

  closeCart.addEventListener("click", () => {
    cartSidebar.classList.remove("open");
  });