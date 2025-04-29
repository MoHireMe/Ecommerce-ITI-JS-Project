export async function fetchProducts() {
  const res = await fetch('/data/db.json');
  const data = await res.json();
  return data.products;
}

export async function saveOrder(order) {
  console.log("Saving order:", order);
}