import { userExists, registerUser } from "../auth.js";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
} from "../utility/validation.js";

const form = document.querySelector("form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const nameInput = document.querySelector("#name");
const phoneInput = document.querySelector("#phone");
const addressInput = document.querySelector("#address");

const checkBoxInput = document.querySelector("#seller");
const error = document.querySelectorAll(".error-message");

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

const displayPhoneErrorMsg = (phone) => {
  if (!validatePhone(phone)) {
    error[3].innerText = "Invalid Phone Number";
  } else {
    error[3].innerText = "";
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailVal = emailInput.value.trim().toLowerCase();
  const passVal = passwordInput.value.trim();
  const nameVal = nameInput.value.trim();
  const phoneVal = phoneInput.value.trim();
  const addressVal = addressInput.value.trim();

  if (
    validateEmail(emailVal) &&
    validatePassword(passVal) &&
    validateName(nameVal) &&
    validatePhone(phoneVal)
  ) {
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
      error[3].innerText = err.message;
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

phoneInput.addEventListener("keyup", (e) => {
  displayPhoneErrorMsg(e.target.value.trim());
});
