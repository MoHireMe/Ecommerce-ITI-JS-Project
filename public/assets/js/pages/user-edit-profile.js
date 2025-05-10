import { getCurrentUser , updateUserProfile} from "../auth.js";
import { validateEmail, validatePassword, validateName, validatePhone } from "../utility/validation.js";

// Authentication is now handled by profile-auth.js
const form = document.getElementById("profileForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("error");

// Get current user and populate form fields
const currentUser = getCurrentUser();
const userId = currentUser ? currentUser.id : null;

// Populate form fields with current user data if user exists
if (currentUser) {
  nameInput.value = currentUser.name || "";
  emailInput.value = currentUser.email || "";
  phoneInput.value = currentUser.phone || "";
  addressInput.value = currentUser.address || "";
  passwordInput.value = currentUser.password || "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = ""; // Clear previous errors

  // Validate fields
  if (!validateName(nameInput.value)) {
    errorMsg.textContent = "Invalid name. Name should be at least 3 letters.";
    return;
  }
  if (!validateEmail(emailInput.value)) {
    errorMsg.textContent = "Invalid email address.";
    return;
  }
  if (phoneInput.value && !validatePhone(phoneInput.value)) {
    errorMsg.textContent = "Invalid phone number. It should be a valid Egyptian phone number.";
    return;
  }
  if (!validatePassword(passwordInput.value)) {
    errorMsg.textContent = "Invalid password. Password must be at least 8 characters, include a digit and a lowercase letter.";
    return;
  }

  // Build user object
  const updatedUser = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    address: addressInput.value,
    password: passwordInput.value
  };

  try {
    await updateUserProfile(userId, updatedUser);
    errorMsg.textContent = "";
    alert("Profile updated successfully!");
  } catch (err) {
    errorMsg.textContent = "Failed to update profile: " + err.message;
  }
});