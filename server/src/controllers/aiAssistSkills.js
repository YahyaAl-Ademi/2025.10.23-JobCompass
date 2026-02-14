import { extractCVskills } from "../services/skillsExtractionService.js";
import { logError } from "../util/logging.js";

/**
 * Controller for assisting with AI-based skill extraction from a resume
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export default async function aiAssistSkills(req, res) {
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide 'prompt' (non-empty string) in the request body.",
      });
    }

    // Extract skills using OpenAI
    const skills = await extractCVskills(prompt);

    return res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    logError(error);

    return res.status(500).json({
      success: false,
      msg: "An error occurred while generating skills based on the provided prompt. Please try again later.",
    });
  }
}
