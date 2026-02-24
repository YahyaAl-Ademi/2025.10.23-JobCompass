export default function createRegExWspaces(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const escaped = value.replace(/[.*+?^${}()|[\]\\#]/g, "\\$&");
  return new RegExp(" " + escaped + " ", "i");
}
