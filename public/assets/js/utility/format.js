export function dateFormatToISO(date) {
  return date.toISOString();
}

export function dateFormatFromISO(str) {
  return str.split("T")[0];
}
