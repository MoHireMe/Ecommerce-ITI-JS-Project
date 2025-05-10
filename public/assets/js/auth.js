// auth.js
export async function registerUser(userData) {
  const res = await fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res) throw new Error("Service Is Down");
  if (!res.ok) throw new Error("Registration failed");
  return await res.json();
}

export async function loginUser(email, password, rememberMe = false) {
  const res = await fetch(`/users?email=${email}`);
  const users = await res.json();
  const user = users.find((u) => u.password === password);

  if (!user) throw new Error("Invalid Email or Password");
  if (!user.isActive) throw new Error("Account is Suspended");

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("currentUser", JSON.stringify(user));
  return user;
}

export async function userExists(email) {
  const res = await fetch(`/users?email=${email}`);
  const users = await res.json();

  return users && users.length > 0;
}

export function logoutUser() {
  sessionStorage.removeItem("currentUser")||localStorage.removeItem("currentUser");
  window.location.href = "/index.html";
}

export function getCurrentUser() {
  return JSON.parse(
    localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
  );
}

export function isLoggedIn() {
  return (
    !!sessionStorage.getItem("currentUser") ||
    !!localStorage.getItem("currentUser")
  );
}

export async function updateUserProfile(userId, newData) {
  const res = await fetch(`/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newData),
  });
  const data = await res.json();

  if (!res.ok) throw new Error("Failed to update profile");

  if (localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", JSON.stringify(data));
  } else if (sessionStorage.getItem("currentUser")) {
    sessionStorage.setItem("currentUser", JSON.stringify(data));
  }

}

export async function deactivateAccount(userId) {
  return await updateUserProfile(userId, { isActive: false });
}

export function checkUserRole(requiredRole) {
  const user = getCurrentUser();
  return user?.role === requiredRole;
}
