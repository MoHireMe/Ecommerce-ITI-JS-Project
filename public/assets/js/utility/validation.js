export function validateEmail(email) {
  const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return pattern.test(email.toLowerCase());
}

export function validatePassword(pass) {
  const regex = /^(?=.*[a-z])(?=.*\d).{8,}$/;
  return regex.test(pass);
}
