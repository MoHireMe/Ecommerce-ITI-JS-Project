export async function getAllApprovedProducts() {
  const res = await fetch("/products?approved=true");
  const data = await res.json();
  if (!res.ok) throw Error("Products Not found");
  if (!res) throw Error("Unexpected Error");
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
