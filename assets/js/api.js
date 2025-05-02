export async function fetchProducts() {
  const res = await fetch('/data/db.json');
  const data = await res.json();
  return data.products;
}

