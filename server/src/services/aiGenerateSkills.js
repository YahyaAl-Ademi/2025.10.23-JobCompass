import openai from "../config/openaiClient.js";
import { skillsGenerationPrompt } from "../config/skillsGenerationPrompt.js";
import { generatedSkillsSchema } from "../config/generatedSkillsSchema.js";
import { zodTextFormat } from "../util/zodTextFormat.js";

/**
 * Extracts a list of skills from the user's resume using OpenAI
 * @param {string} userPrompt - The user's resume text
 * @returns {Promise<string[]>} Array of extracted skills
 * @throws {Error} If skill extraction fails
 */
export default async function aiGenerateSkills(userPrompt) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "developer",
        content: skillsGenerationPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    text: {
      format: zodTextFormat(generatedSkillsSchema, "skills_output"),
    },
    temperature: 0.2,
    max_output_tokens: 5000,
  });

  const parsedResult = JSON.parse(response.output_text);
  return parsedResult.skills || [];
}
