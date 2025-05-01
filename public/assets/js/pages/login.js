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
  const emailVal = emailInput.value.trim();
  const passVal = passwordInput.value.trim();

  if (validateEmail(emailVal) && validatePassword(passVal)) {
    try {
      console.log();
      await loginUser(emailVal, passVal, checkBoxInput.checked);
      window.location.href = "./index.html";
    } catch (err) {
      error[1].innerText = err.message;
    }
  }
});

emailInput.addEventListener("keyup", (e) => {
  displayEmailErrorMsg(e.target.value.trim());
});

passwordInput.addEventListener("keyup", (e) => {
  displayPasswordErrorMsg(e.target.value.trim());
});
