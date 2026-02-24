import normalizeText from "../../../shared/normalizeText";

/**
 * Validates skill input text for format, content, and duplication.
 *
 * @param {Object} options - The validation options object.
 * @param {string} options.skill - The skill text to validate.
 * @param {string[]} [options.skills=[]] - Array of existing skill names.
 *
 * @returns {Object|null} Validation result object with type and message, or null if valid.
 * @returns {string} returns.type - The validation result type: "error" or "warning".
 * @returns {string} returns.message - The validation message describing the issue.
 */
export default function validateSkillInput({ skill, skills = [] }) {
  if (typeof skill !== "string") {
    return {
      type: "error",
      message: "The skill must be a text value.",
    };
  }

  if (skill.length < 2) {
    return {
      type: "error",
      message:
        "The skill name is too short. Please enter a skill name with at least 2 characters.",
    };
  }

  const hasInvalidChars = /[^a-zA-Z0-9 \-/#+]/;
  if (hasInvalidChars.test(skill)) {
    return {
      type: "error",
      message:
        "Invalid characters detected. Allowed characters are letters, numbers, spaces, and these symbols: -/#+",
    };
  }

  const isNumbersOnly = /^\d+$/.test(skill);
  if (isNumbersOnly) {
    return {
      type: "warning",
      message: "The skill cannot consist of numbers only.",
    };
  }

  const normalizedSkills = skills.map((skill) => normalizeText(skill));
  if (normalizedSkills.includes(normalizeText(skill))) {
    return {
      type: "error",
      message: "This skill is already added.",
    };
  }

  return null;
}
