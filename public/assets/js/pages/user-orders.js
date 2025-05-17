import {
  getOrdersByCustomerId,
  getOrderProductsById,
  getProductNameById,
  addReview,
} from "../../js/api.js";
import {
  dateFormatFromISO,
  dateFormatToISO,
  getDateObjectFromISO,
} from "../../js/utility/format.js";
import { getCurrentUser } from "../auth.js";
document.addEventListener("DOMContentLoaded", async () => {
  // Get DOM elements
  const productDialog = document.getElementById("product-dialog");
  const ordersTableBody = document.getElementById("orders-table-body");
  const noOrdersElement = document.getElementById("no-orders");
  const loadingElement = document.getElementById("loading");
  const errorElement = document.getElementById("error");
  const ordersContentElement = document.getElementById("orders-content");

  try {
    // Get the current user from both localStorage and sessionStorage
    const currentUser = getCurrentUser();

    // Authentication is now handled by profile-auth.js

    // Fetch all orders
    const allOrders = await getOrdersByCustomerId(currentUser.id);

    // Filter orders by current user's ID
    const userOrders = allOrders.filter(
      (order) => order.customerId === currentUser.id
    );

    // Hide loading indicator
    loadingElement.style.display = "none";

    if (userOrders.length === 0) {
      // Show no orders message if user has no orders
      noOrdersElement.style.display = "block";
    } else {
      // Show orders content and populate table
      ordersContentElement.style.display = "block";

      // Sort orders by date (newest first)
      userOrders.sort(
        (a, b) =>
          getDateObjectFromISO(b.createdAt) - getDateObjectFromISO(a.createdAt)
      );

      // Populate the table with user orders
      for (const order of userOrders) {
        const orderRow = document.createElement("tr");

        // Format date
        const orderDate = dateFormatFromISO(order.createdAt);

        // Get order products
        const orderProducts = await getOrderProductsById(order.id);
        const itemsCount = orderProducts.length;

        // Create status element with appropriate class
        const statusElement = document.createElement("span");
        statusElement.textContent = order.status || "Pending";
        statusElement.classList.add("order-status");

        // Add status-specific class
        const statusClass = `status-${(
          order.status || "pending"
        ).toLowerCase()}`;
        statusElement.classList.add(statusClass);

        // Create details button
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "View Details";
        detailsButton.classList.add("order-details-btn");
        detailsButton.addEventListener("click", () => {
          showOrderDetailsDialog(order, orderProducts);
        });

        // Populate the row cells
        orderRow.innerHTML = `
          <td>#${order.id.substring(0, 8)}</td>
          <td>${orderDate}</td>
          <td>$${order.total.toFixed(2)}</td>
          <td></td>
          <td>${itemsCount} item${itemsCount !== 1 ? "s" : ""}</td>
          <td></td>
        `;

        // Add status element to the status cell
        orderRow.cells[3].appendChild(statusElement);

        // Add details button to the actions cell
        orderRow.cells[5].appendChild(detailsButton);

        // Add the row to the table
        ordersTableBody.appendChild(orderRow);
      }
    }
  } catch (error) {
    // Handle errors
    loadingElement.style.display = "none";
    errorElement.textContent = `Error loading orders: ${error.message}`;
    console.error("Error loading orders:", error);
  }
});

// Function to show order details in a dialog
async function showOrderDetailsDialog(order, products) {
  const productDialog = document.getElementById("product-dialog");

  // Clear any existing content
  productDialog.innerHTML = "";

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.id = "close-dialog-btn";
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", () => {
    productDialog.close();
  });

  // Create dialog title
  const dialogTitle = document.createElement("h2");
  dialogTitle.classList.add("dialog-title");
  dialogTitle.textContent = `Order Details #${order.id.substring(0, 8)}`;

  // Create order summary section
  const orderSummary = document.createElement("div");
  orderSummary.classList.add("order-summary");

  const orderDate = dateFormatFromISO(order.createdAt);

  orderSummary.innerHTML = `
    <p><strong>Date:</strong> ${orderDate}</p>
    <p><strong>Status:</strong> <span class="order-status status-${(
      order.status || "pending"
    ).toLowerCase()}">${order.status || "Pending"}</span></p>
    <p><strong>Order ID:</strong> ${order.id}</p>
  `;

  // Create table for products
  const table = document.createElement("table");
  const tableHead = document.createElement("thead");
  const tableBody = document.createElement("tbody");

  // Create table header
  const headerRow = document.createElement("tr");
  [
    "Product ID",
    "Product Name",
    "Quantity",
    "Price",
    "Total",
    "Actions",
  ].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  // Create table rows for each product
  let orderTotal = 0;

  for (const product of products) {
    const row = document.createElement("tr");

    // Get product name
    let productName = product.name;
    if (!productName) {
      try {
        productName = await getProductNameById(product.productId);
      } catch (error) {
        productName = "Unknown Product";
        console.error("Error fetching product name:", error);
      }
    }

    // Calculate product total
    const productPrice = parseFloat(
      product.priceAtPurchase || product.price || 0
    );
    const productQuantity = parseInt(product.quantity || 1);
    const productTotal = productPrice * productQuantity;
    orderTotal += productTotal;

    // Create table cells
    const cells = [
      product.productId,
      productName,
      productQuantity,
      `$${productPrice}`,
      `$${productTotal}`,
    ];

    cells.forEach((cellText) => {
      const td = document.createElement("td");
      td.textContent = cellText;
      row.appendChild(td);
    });

    // Add review button cell
    const actionCell = document.createElement("td");
    const reviewButton = document.createElement("button");
    reviewButton.textContent = "Add Review";
    reviewButton.classList.add("review-btn");
    reviewButton.style.backgroundColor = "#28a745";
    reviewButton.style.color = "white";
    reviewButton.style.border = "none";
    reviewButton.style.padding = "5px 10px";
    reviewButton.style.borderRadius = "4px";
    reviewButton.style.cursor = "pointer";

    reviewButton.addEventListener("click", () => {
      showReviewForm(
        product.productId,
        productName,
        productDialog,
        order,
        products
      );
    });

    actionCell.appendChild(reviewButton);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  }

  // Add table to dialog
  table.appendChild(tableHead);
  table.appendChild(tableBody);

  // Create order total element
  const orderTotalElement = document.createElement("div");
  orderTotalElement.classList.add("order-total");
  orderTotalElement.textContent = `Order Total: $${orderTotal}`;

  // Add all elements to dialog
  productDialog.appendChild(closeButton);
  productDialog.appendChild(dialogTitle);
  productDialog.appendChild(orderSummary);
  productDialog.appendChild(table);
  productDialog.appendChild(orderTotalElement);

  // Show the dialog
  productDialog.showModal();
}

// Function to show review form
function showReviewForm(
  productId,
  productName,
  productDialog,
  order,
  products
) {
  // Clear dialog content
  productDialog.innerHTML = "";

  // Create review form
  const reviewForm = document.createElement("div");
  reviewForm.classList.add("review-form");

  // Create form title
  const formTitle = document.createElement("h2");
  formTitle.classList.add("dialog-title");
  formTitle.textContent = `Add Review for ${productName}`;

  // Create form elements
  const ratingLabel = document.createElement("label");
  ratingLabel.textContent = "Rating (1-5):";
  ratingLabel.setAttribute("for", "rating");

  const ratingSelect = document.createElement("select");
  ratingSelect.id = "rating";
  ratingSelect.style.padding = "8px";
  ratingSelect.style.margin = "8px 0 16px";
  ratingSelect.style.width = "100%";
  ratingSelect.style.borderRadius = "4px";
  ratingSelect.style.border = "1px solid #ddd";

  for (let i = 1; i <= 5; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i} Star${i > 1 ? "s" : ""}`;
    ratingSelect.appendChild(option);
  }

  // Default to 5 stars
  ratingSelect.value = 5;

  const commentLabel = document.createElement("label");
  commentLabel.textContent = "Your Review:";
  commentLabel.setAttribute("for", "comment");

  const commentTextarea = document.createElement("textarea");
  commentTextarea.id = "comment";
  commentTextarea.style.width = "100%";
  commentTextarea.style.padding = "8px";
  commentTextarea.style.margin = "8px 0 16px";
  commentTextarea.style.borderRadius = "4px";
  commentTextarea.style.border = "1px solid #ddd";
  commentTextarea.style.minHeight = "100px";
  commentTextarea.style.resize = "vertical";

  // Create error message element
  const errorMessage = document.createElement("p");
  errorMessage.style.color = "red";
  errorMessage.style.margin = "8px 0";
  errorMessage.style.display = "none";

  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.justifyContent = "space-between";
  buttonsContainer.style.marginTop = "20px";

  // Create back button
  const backButton = document.createElement("button");
  backButton.textContent = "Back to Order";
  backButton.style.padding = "8px 16px";
  backButton.style.backgroundColor = "#6c757d";
  backButton.style.color = "white";
  backButton.style.border = "none";
  backButton.style.borderRadius = "4px";
  backButton.style.cursor = "pointer";

  backButton.addEventListener("click", () => {
    // Instead of restoring HTML content, recreate the order details dialog
    showOrderDetailsDialog(order, products);
  });

  // Create submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit Review";
  submitButton.style.padding = "8px 16px";
  submitButton.style.backgroundColor = "#28a745";
  submitButton.style.color = "white";
  submitButton.style.border = "none";
  submitButton.style.borderRadius = "4px";
  submitButton.style.cursor = "pointer";

  submitButton.addEventListener("click", async () => {
    // Validate form
    if (!commentTextarea.value.trim()) {
      errorMessage.textContent = "Please enter your review comment";
      errorMessage.style.display = "block";
      return;
    }

    try {
      // Get current user
      const currentUser = getCurrentUser();

      if (!currentUser || !currentUser.id) {
        errorMessage.textContent = "You must be logged in to submit a review";
        errorMessage.style.display = "block";
        return;
      }

      // Create review object
      const review = {
        productId: productId,
        userId: currentUser.id,
        userName: currentUser.name,
        rating: parseInt(ratingSelect.value),
        comment: commentTextarea.value.trim(),
        createdAt: dateFormatToISO(new Date()),
      };

      // Submit review
      await addReview(review);

      // Show success message
      reviewForm.innerHTML = `
        <h2 class="dialog-title">Review Submitted</h2>
        <p style="text-align: center; margin: 30px 0;">Thank you for your review!</p>
        <div style="text-align: center;">
          <button id="close-review-dialog" style="padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
      `;

      // Add event listener to close button
      document
        .getElementById("close-review-dialog")
        .addEventListener("click", () => {
          productDialog.close();
        });
    } catch (error) {
      errorMessage.textContent = `Error submitting review: ${error.message}`;
      errorMessage.style.display = "block";
      console.error("Error submitting review:", error);
    }
  });

  // Add buttons to container
  buttonsContainer.appendChild(backButton);
  buttonsContainer.appendChild(submitButton);

  // Add all elements to form
  reviewForm.appendChild(formTitle);
  reviewForm.appendChild(ratingLabel);
  reviewForm.appendChild(ratingSelect);
  reviewForm.appendChild(commentLabel);
  reviewForm.appendChild(commentTextarea);
  reviewForm.appendChild(errorMessage);
  reviewForm.appendChild(buttonsContainer);

  // Add form to dialog
  productDialog.appendChild(reviewForm);
}
