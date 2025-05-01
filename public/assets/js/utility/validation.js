export function validateEmail(email) {
  const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return pattern.test(email.toLowerCase());
}

export function validatePassword(pass) {
  const regex = /^(?=.*[a-z])(?=.*\d).{8,}$/;
  return regex.test(pass);
}

export function validateName(name) {
  const re = /^[a-zA-Z\s]{3,}$/;
  return re.test(name.trim());
}

export function validatePhone(phone) {
  const re = /^01[0125][0-9]{8}$/;
  return re.test(phone.trim());
}
