export async function getAllApprovedProducts(searchQuery = "") {
  // Fetch approved products from the API
  const res = await fetch("/products?approved=true");
  const data = await res.json();
  
  if (!res.ok) throw Error("Products Not found");
  if (!res) throw Error("Unexpected Error");

  // If a search query is provided, filter products based on the query
  if (searchQuery) {
    return data.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Return all products if no search query
  return data;
}

export async function getApprovedProduct(id) {
  if (!id) throw Error("Invalid Product ID");
  const res = await fetch(`/products?approved=true&id=${id}`);
  const data = await res.json();
  if (!res.ok || !data || data.length == 0) throw Error("Product Not found");
  if (!res) throw Error("Unexpected Error");
  return data[0];
}

export async function getAllProducts() {
  const res = await fetch("/products");
  const data = await res.json();
  if (!res.ok || !data || data.length == 0) throw Error("Products Not found");
  if (!res) throw Error("Unexpected Error");
  return data;
}
export async function getAllProductsBySellerId(id) {
  if (!id) throw Error("Invalid Product ID");
  const res = await fetch(`/products?sellerId=${id}`);
  const data = await res.json();
  if (!res.ok || !data || data.length == 0) throw Error("Products Not found");
  if (!res) throw Error("Unexpected Error");
  return data;
}

export async function getSellerNameById(id) {
  if (!id) throw Error("Invalid Users ID");
  const res = await fetch(`/users?role=seller&id=${id}`);
  const data = await res.json();
  if (!res.ok) throw Error("Seller Not found");
  if (!res) throw Error("Unexpected Error");
  return data[0].name;
}

export async function getCustomerNameById(id) {
  if (!id) throw Error("Invalid Users ID");
  const res = await fetch(`/users?role=customer&id=${id}`);
  const data = await res.json();
  if (!res.ok) throw Error("Customer Not found");
  if (!res) throw Error("Unexpected Error");
  return data[0].name;
}

export async function getProductNameById(id) {
  if (!id) throw Error("Invalid Product ID");
  const res = await fetch(`/products/${id}`);
  const data = await res.json();
  if (!res.ok) throw Error("Product Not found");
  if (!res) throw Error("Unexpected Error");
  return data.name;
}

export async function getAllReviewsByProductId(id) {
  if (!id) throw Error("Invalid Product ID");
  const res = await fetch(`/reviews?productId=${id}`);
  const data = await res.json();
  if (!res.ok) throw Error("Reviews Not found");
  if (!res) throw Error("Unexpected Error");
  return data;
}

export async function getAllOrders() {
  const res = await fetch(`/orders`);
  const data = await res.json();
  if (!res.ok) throw Error("Orders Not found");
  if (!res) throw Error("Unexpected Error");
  return data;
}

export async function getOrderProductsById(id) {
  const res = await fetch(`/orders/${id}`);
  const data = await res.json();
  if (!res.ok) throw Error("Orders Not found");
  if (!res) throw Error("Unexpected Error");
  return data.products;
}

export async function getOrdersByCustomerId(id) {
  const res = await fetch(`/orders?customerId=${id}`);
  const data = await res.json();
  if (!res.ok) throw Error("Orders Not found");
  if (!res) throw Error("Unexpected Error");
  return data;
}

export async function deleteProductById(id) {
  if (!id) throw Error("Invalid Product ID");
  await fetch(`/products/${id}`, {
    method: "DELETE",
  });
}
export async function deleteOrderById(id) {
  if (!id) throw Error("Invalid Product ID");
  await fetch(`/orders/${id}`, {
    method: "DELETE",
  });
}

export async function updateProductById(updatedItem) {
  const res = await fetch(`/products/${updatedItem.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedItem),
  });
  if (!res.ok) throw new Error("Update failed");
}

export async function updateOrderById(updatedItem) {
  const res = await fetch(`/orders/${updatedItem.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedItem),
  });
  if (!res.ok) throw new Error("Update failed");
}

export async function addNewProduct(item) {
  const res = await fetch(`/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Addtion failed");
}

export async function addReview(review) {
  const res = await fetch(`/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error("Failed to add review");
  return await res.json();
}

// Get cart items for a given order
export async function getCartItems(orderId) {
  const res = await fetch(`/cart/${orderId}`);
  if (!res.ok) throw new Error("Failed to fetch cart items");
  return await res.json();
}

// Submit order
export async function submitOrder(order) {
  try {
    // Assuming you're using fetch to interact with the backend (db.json or API)
    const response = await fetch('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error('Order submission failed');
    }

    return response; // Return the response or data after successful order creation
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}
