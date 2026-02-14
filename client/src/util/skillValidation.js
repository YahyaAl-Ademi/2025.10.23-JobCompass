/**
 * Validates skill input text for format, content, and duplication.
 *
 * @param {Object} options - The validation options object.
 * @param {string} options.text - The skill text to validate.
 * @param {Array<{normalizedSkill: string}>} [options.skills=[]] - Array of existing skills with normalized versions.
 *
 * @returns {Object|null} Validation result object with type and message, or null if valid.
 * @returns {string} returns.type - The validation result type: "error" or "warning".
 * @returns {string} returns.message - The validation message describing the issue.
 */
export default function validateSkillInput({ text, skills = [] }) {
  if (text.length < 2) {
    return {
      type: "error",
      message:
        "The skill name is too short. Please enter a skill name with at least 2 characters.",
    };
  }

  const hasInvalidChars = /[^a-zA-Z0-9 \-/#+]/;
  if (hasInvalidChars.test(text)) {
    return {
      type: "error",
      message:
        "Invalid characters detected. Allowed characters are letters, numbers, spaces, and these symbols: -/#+",
    };
  }

  const isNumbersOnly = /^\d+$/.test(text);
  if (isNumbersOnly) {
    return {
      type: "warning",
      message: "The skill cannot consist of numbers only.",
    };
  }

  const normalizedText = text.toLowerCase();
  const normalizedSkills = skills.map((s) => s.normalizedSkill);
  if (normalizedSkills.includes(normalizedText)) {
    return {
      type: "error",
      message: "This skill is already added.",
    };
  }

  return null;
}
