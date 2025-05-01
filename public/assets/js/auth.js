// auth.js
export async function registerUser(userData) {
  const res = await fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Registration failed");
  return await res.json();
}

export async function loginUser(email, password, rememberMe = false) {
  const res = await fetch(`/users?email=${email}`);
  const users = await res.json();
  const user = users.find((u) => u.password === password);

  if (!user) throw new Error("Invalid Email or Password");
  if (!user.isActive) throw new Error("Account is inactive");

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("currentUser", JSON.stringify(user));
  return user;
}

export function logoutUser() {
  sessionStorage.removeItem("currentUser");
}

export function getCurrentUser() {
  return JSON.parse(
    localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
  );
}

export function isLoggedIn() {
  return !!sessionStorage.getItem("currentUser");
}

export async function updateUserProfile(userId, newData) {
  const res = await fetch(`/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return await res.json();
}

export async function deactivateAccount(userId) {
  return await updateUserProfile(userId, { isActive: false });
}

export function checkUserRole(requiredRole) {
  const user = getCurrentUser();
  return user?.role === requiredRole;
}
