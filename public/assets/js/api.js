export async function getAllApprovedProducts() {
  const res = await fetch("/products?approved=true");
  const data = await res.json();
  return data;
}
