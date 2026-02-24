export default function getSkillsInDescription(
  normalized_description,
  skills = [],
) {
  return skills
    .filter((s) => normalized_description.includes(` ${s?.normalizedSkill} `))
    .map((s) => s.skill);
}
