import normalizeText from "../../../shared/normalizeText";

export default function getSkillsInDescription(
  normalized_description = "",
  skills = [],
) {
  return skills.filter((skill) =>
    normalized_description.includes(normalizeText(skill)),
  );
}
