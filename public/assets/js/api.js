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

export async function getAllReviewsByProductId(id) {
  if (!id) throw Error("Invalid Product ID");
  const res = await fetch(`/reviews?productId=${id}`);
  const data = await res.json();
  if (!res.ok) throw Error("Reviews Not found");
  if (!res) throw Error("Unexpected Error");
  return data;
}
