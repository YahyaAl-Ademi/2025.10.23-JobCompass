import { extractCVskills } from "../services/skillsExtractionService.js";
import { logError } from "../util/logging.js";

/**
 * Controller for assisting with AI-based skill extraction from a resume
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export default async function aiAssistSkills(req, res) {
  let responseStatus = 200;
  let responseData = { success: true, skills: [], msg: "" };

  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      responseStatus = 400;
      responseData = {
        success: false,
        msg: "You need to provide 'prompt' (non-empty string) in the request body.",
      };
    } else {
      // Extract skills using OpenAI
      const skills = await extractCVskills(prompt);
      responseData = { ...responseData, skills };
    }
  } catch (error) {
    logError(error);
    responseStatus = 500;
    responseData = {
      success: false,
      msg: "An error occurred while generating skills based on the provided prompt. Please try again later.",
    };
  }

  res.status(responseStatus).json(responseData);
}
