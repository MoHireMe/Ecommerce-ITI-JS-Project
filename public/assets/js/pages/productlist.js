import getProductCard from "../../components/product-card.js";
import { getAllApprovedProducts } from "../api.js";

const products = await getAllApprovedProducts();
const productList = document.createElement("div");

productList.classList.add("productList-container");

products.forEach(({ id, name, price, image, category }) => {
  const card = getProductCard(image, name, 5, price, category, id);
  productList.append(card);
});

document.body.append(productList);
