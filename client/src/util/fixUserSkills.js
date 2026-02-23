import regexEndNormalizeSkill from "./regexEndNormalizeSkill";

export default function fixUserSkills(skills) {
  let result = [];
  if (Array.isArray(skills)) {
    result = skills.map((skill) => regexEndNormalizeSkill(skill));
  }
  return result;
}
