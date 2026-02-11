export default function normalizeEmploymentType(typeList) {
  let result = null;
  if (Array.isArray(typeList) && typeList.length > 0) {
    const type = typeList[0];
    if (typeof type === "string" && type.length > 0) {
      if (type === "Intern") {
        result = "Internship";
      } else {
        result = (
          type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
        ).replace("_", "-");
      }
    }
  }
  return result;
}
