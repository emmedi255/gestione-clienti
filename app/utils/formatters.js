export function capitalizeWords(str) {
  if (!str) return null;

  return str
    .toLowerCase()
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
