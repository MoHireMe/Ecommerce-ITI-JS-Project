import {
  getApprovedProduct,
  getSellerNameById,
  getAllReviewsByProductId,
  getCustomerNameById,
} from "../api.js";
import { dateFormatFromISO } from "../utility/format.js";

const imgTag = document.querySelector(".img-container img");
const titleTag = document.querySelector(".title");
const descriptionTag = document.querySelector(".description");
const sellerTag = document.querySelector(".seller");
const ratingsTag = document.querySelector(".total-ratings");
const starTag = document.querySelector(".star");
const catTag = document.querySelector(".cat");
const priceTag = document.querySelector(".price");
const reviewsTag = document.querySelector(".reviews-container");

const query = new URLSearchParams(window.location.search);
const pId = query.get("id");

const calculateAvgReviews = (reviews) => {
  let sum = 0;
  reviews.forEach(({ rating }) => {
    sum += Number(rating);
  });

  return sum / reviews.length;
};

const displayProductData = async ({
  id,
  image,
  name,
  description,
  sellerId,
  category,
  price,
}) => {
  imgTag.src = image;
  titleTag.innerText = name;
  document.title = name;
  descriptionTag.innerText = description;

  sellerTag.innerText = await getSellerNameById(sellerId);

  const reviews = await getAllReviewsByProductId(id);
  ratingsTag.innerText = `${reviews.length} Ratings`;
  starTag.innerText = `${calculateAvgReviews(reviews)}⭐`;

  catTag.innerText = category;

  priceTag.innerText = `${price} EGP`;
};

const displayCommentSection = (review) => {
  if (review.length > 0 && review) {
    review.forEach(async ({ userId, rating, comment, createdAt }) => {
      const reviewDiv = document.createElement("div");
      reviewDiv.classList.add("review-container");

      reviewDiv.innerHTML = ` 
      <h3 class="user-info">${await getCustomerNameById(userId)}</h3>
          <span class="review-date">${dateFormatFromISO(createdAt)}</span>
          <span class="review-star">${rating}⭐</span>
          <p class="review-comment">${comment}</p>`;
      reviewsTag.append(reviewDiv);
    });
  }
};

try {
  let product = await getApprovedProduct(pId);
  displayProductData(product);

  displayCommentSection(await getAllReviewsByProductId(product.id));
} catch (err) {
  alert(err.message);
  window.history.back();
}
