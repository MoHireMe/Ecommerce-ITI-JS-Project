import { userExists, registerUser } from "../auth.js";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateAddress,
} from "../utility/validation.js";

const form = document.querySelector("form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const nameInput = document.querySelector("#name");
const phoneInput = document.querySelector("#phone");
const addressInput = document.querySelector("#address");

const checkBoxInput = document.querySelector("#seller");
// Get all error message elements
const error = document.querySelectorAll(".error-message");
// Verify we have the correct number of error elements
console.log("Number of error elements:", error.length);

const displayNameErrorMsg = (fName) => {
  if (!validateName(fName)) {
    error[0].innerText = "Invalid Name, Use English letters Only";
  } else {
    error[0].innerText = "";
  }
};

const displayEmailErrorMsg = (email) => {
  if (!validateEmail(email)) {
    error[1].innerText = "Invalid Email";
  } else {
    error[1].innerText = "";
  }
};

const displayPasswordErrorMsg = (pass) => {
  if (!validatePassword(pass)) {
    error[2].innerText =
      "Invalid password , Make sure your password has 8 characters and at least a number and a letter ";
  } else {
    error[2].innerText = "";
  }
};

const displayAddressErrorMsg = (address) => {
  if (!validateAddress(address)) {
    error[3].innerText = "Please enter a valid address (minimum 5 characters)";
    return false;
  } else {
    error[3].innerText = "";
    return true;
  }
};

const displayPhoneErrorMsg = (phone) => {
  if (!validatePhone(phone)) {
    error[4].innerText = "Invalid Phone Number";
  } else {
    error[4].innerText = "";
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Get all input values
  const emailVal = emailInput.value.trim().toLowerCase();
  const passVal = passwordInput.value.trim();
  const nameVal = nameInput.value.trim();
  const phoneVal = phoneInput.value.trim();
  const addressVal = addressInput.value.trim();
  
  // Check for empty fields first
  let hasEmptyFields = false;
  
  if (!nameVal) {
    error[0].innerText = "Name is required";
    hasEmptyFields = true;
  }
  
  if (!emailVal) {
    error[1].innerText = "Email is required";
    hasEmptyFields = true;
  }
  
  if (!passVal) {
    error[2].innerText = "Password is required";
    hasEmptyFields = true;
  }
  
  if (!addressVal) {
    error[3].innerText = "Address is required";
    hasEmptyFields = true;
  }
  
  if (!phoneVal) {
    error[4].innerText = "Phone number is required";
    hasEmptyFields = true;
  }
  
  // If any field is empty, don't proceed with form submission
  if (hasEmptyFields) {
    return;
  }
  
  // Validate input formats
  const isNameValid = validateName(nameVal);
  const isEmailValid = validateEmail(emailVal);
  const isPasswordValid = validatePassword(passVal);
  const isAddressValid = validateAddress(addressVal);
  const isPhoneValid = validatePhone(phoneVal);
  
  // Display validation errors if any
  displayNameErrorMsg(nameVal);
  displayEmailErrorMsg(emailVal);
  displayPasswordErrorMsg(passVal);
  displayAddressErrorMsg(addressVal);
  displayPhoneErrorMsg(phoneVal);
  
  // Disable form and show loading only if all validations pass
  if (
    isNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isAddressValid &&
    isPhoneValid
  ) {
    // Disable form and show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "SIGNING UP...";
    
    try {
      if (await userExists(emailVal)) {
        console.log(userExists(emailVal));
        throw new Error("User Already exists");
      }
      const user = {
        name: nameVal,
        email: emailVal,
        password: passVal,
        role: checkBoxInput.checked ? "seller" : "customer",
        address: addressVal,
        phone: phoneVal,
        isActive: true,
      };
      await registerUser(user);
      window.location.href = "./login";
    } catch (err) {
      error[1].innerText = err.message; // Show at email error position
      
      // Re-enable form on error
      submitBtn.disabled = false;
      submitBtn.textContent = "SIGNUP";
    }
  }
});

nameInput.addEventListener("keyup", (e) => {
  displayNameErrorMsg(e.target.value.trim());
});

emailInput.addEventListener("keyup", (e) => {
  displayEmailErrorMsg(e.target.value.trim());
});

passwordInput.addEventListener("keyup", (e) => {
  displayPasswordErrorMsg(e.target.value.trim());
});

addressInput.addEventListener("keyup", (e) => {
  displayAddressErrorMsg(e.target.value.trim());
});

phoneInput.addEventListener("keyup", (e) => {
  displayPhoneErrorMsg(e.target.value.trim());
});
