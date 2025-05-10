export function dateFormatToISO(date) {
  return date.toISOString();
}

export function dateFormatFromISO(str) {
  if (!str) return '';
  // For display purposes, return the formatted date
  return str.split("T")[0];
}

export function getDateObjectFromISO(str) {
  if (!str) return new Date(0); // Return epoch if no date
  return new Date(str);
}
