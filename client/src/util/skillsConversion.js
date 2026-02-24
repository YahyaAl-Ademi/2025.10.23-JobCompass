/**
 * Prepare a skill string for reliable matching and comparison.
 * - Produce a normalized version of the skill where hyphens, slashes and whitespace
 *   are replaced with single spaces to help with text comparisons.
 *
 * Parameters:
 * @param {string} skill - The raw skill text to escape and normalize.
 *
 * Returns:
 * @returns {{ skill: string, normalizedSkill: string }}
 * - skill: the original input string.
 * - normalizedSkill: the input with hyphens, slashes and whitespace collapsed to single
 *   spaces (useful for normalization and comparisons).
 */

export function convertName2Obj(skill) {
  let normalizedSkill = skill;
  normalizedSkill = normalizedSkill
    .toLowerCase()
    .replace(/[-/\s]/g, " ")
    .replace(/ +/g, " ");
  return { skill, normalizedSkill };
}

export function convertNames2Objects(skills) {
  let result = [];
  if (Array.isArray(skills)) {
    result = skills.map((skill) => convertName2Obj(skill));
  }
  return result;
}

export function convertObjects2Names(skills) {
  return skills.map((s) => s.skill);
}
