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
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "developer",
        content: skillsExtractionPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: zodTextFormat(generatedSkillsSchema, "skills_output"),
    temperature: 0.2,
    max_tokens: 5000,
  });

  if (response.choices[0].finish_reason !== "stop") {
    throw new Error("We were unable to generate the skills");
  }

  const parsedResult = JSON.parse(response.choices[0].message.content);
  return parsedResult.skills || [];
}
