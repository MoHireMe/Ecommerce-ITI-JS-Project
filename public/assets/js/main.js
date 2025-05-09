// MOBILE SIDEBAR
const menuBtn = document.querySelector(".mobile-menu-button");
const mobileSidebar = document.querySelector(".mobile-sidebar");
const closeBtn = document.querySelector(".close-btn");

menuBtn.addEventListener("click", () => {
  mobileSidebar.classList.add("active");
  document.body.classList.add("sidebar-open");
});

closeBtn.addEventListener("click", () => {
  mobileSidebar.classList.remove("active");
  document.body.classList.remove("sidebar-open");
});

// CART SIDEBAR
const cartIcon = document.querySelector(".fa-shopping-cart");
const cartSidebar = document.querySelector(".cart-sidebar");
const closeCart = document.querySelector(".close-cart");

cartIcon.addEventListener("click", () => {
  cartSidebar.classList.add("open");
});

closeCart.addEventListener("click", () => {
  cartSidebar.classList.remove("open");
});

// DASHBOARD SIDEBAR
const dashboardSidebar = document.getElementById('dashboard-sidebar');
const togglePanel = document.getElementById('togglePanel');

togglePanel.addEventListener('click', () => {
  dashboardSidebar.classList.toggle('expanded');
  togglePanel.classList.toggle('sidebar-expanded');
});





