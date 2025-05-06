import getProductCard from "../../components/product-card.js";
import { getAllApprovedProducts } from "../api.js";

let products = [];
const productList = document.createElement("div");
productList.classList.add("productList-container");

try {
  products = await getAllApprovedProducts();
} catch (err) {
  alert(err.message);
}

products.forEach(({ id, name, price, image, category }) => {
  const card = getProductCard(image, name, 5, price, category, id);

  productList.append(card);
});

document.body.append(productList);
