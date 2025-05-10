import { loginUser } from "../auth.js";
import { validateEmail, validatePassword } from "../utility/validation.js";

const form = document.querySelector("form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const checkBoxInput = document.querySelector("#remember");
const error = document.querySelectorAll(".error-message");

const displayEmailErrorMsg = (email) => {
  if (!validateEmail(email)) {
    error[0].innerText = "Invalid Email";
  } else {
    error[0].innerText = "";
  }
};

const displayPasswordErrorMsg = (pass) => {
  if (!validatePassword(pass)) {
    error[1].innerText =
      "Invalid password , Make sure your password has 8 characters and at least a number and a letter ";
  } else {
    error[1].innerText = "";
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Disable form and show loading (change #1)
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "LOGGING IN...";
  
  const emailVal = emailInput.value.trim();
  const passVal = passwordInput.value.trim();
  
  // Clear previous errors
  error[0].innerText = "";
  error[1].innerText = "";
  
  // Improved validation (change #6)
  let isValid = true;
  
  if (!emailVal) {
    error[0].innerText = "Email is required";
    isValid = false;
  } else if (!validateEmail(emailVal)) {
    error[0].innerText = "Invalid email format";
    isValid = false;
  }
  
  if (!passVal) {
    error[1].innerText = "Password is required";
    isValid = false;
  } else if (!validatePassword(passVal)) {
    error[1].innerText = "Invalid password format";
    isValid = false;
  }
  
  if (isValid) {
    try {
      // Login the user
      const user = await loginUser(emailVal, passVal, checkBoxInput.checked);
      
      // Redirect based on user role
      if (user.role === 'admin') {
        // Redirect admin to user management dashboard
        window.location.href = '/dashboard/admin/user-manage.html';
      } else if (user.role === 'seller') {
        // Redirect seller to order management dashboard
        window.location.href = '/dashboard/Seller/order-manage.html';
      } else {
        // Redirect customer to home page
        window.location.href = '/index.html';
      }
    } catch (err) {
      error[1].innerText = err.message;
      
      // Re-enable form on error
      submitBtn.disabled = false;
      submitBtn.textContent = "LOGIN";
    }
  } else {
    // Re-enable form if validation fails
    submitBtn.disabled = false;
    submitBtn.textContent = "LOGIN";
  }
});

emailInput.addEventListener("keyup", (e) => {
  displayEmailErrorMsg(e.target.value.trim());
});

passwordInput.addEventListener("keyup", (e) => {
  displayPasswordErrorMsg(e.target.value.trim());
});
