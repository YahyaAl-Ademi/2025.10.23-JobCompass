import openai from "../config/openaiClient.js";
import { skillsExtractionPrompt } from "../config/skillsExtractionPrompt.js";
import { generatedSkillsSchema } from "../config/generatedSkillsSchema.js";
import { zodTextFormat } from "../util/zodTextFormat.js";

/**
 * Extracts a list of skills from the user's resume using OpenAI
 * @param {string} userPrompt - The user's resume text
 * @returns {Promise<string[]>} Array of extracted skills
 * @throws {Error} If skill extraction fails
 */
export async function extractCVskills(userPrompt) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "developer",
        content: skillsExtractionPrompt,
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

  const outputText = response.output_text;

  if (!outputText) {
    throw new Error("AI was unable to generate the skills");
  }

  const parsedResult = JSON.parse(outputText);
  return parsedResult.skills || [];
}
