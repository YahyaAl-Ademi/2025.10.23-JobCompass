export default function normalizeText(str) {
  if (typeof str !== "string" || str.length === 0) {
    return "";
  }

  return ` ${str
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/ +/g, " ")} `;
}
