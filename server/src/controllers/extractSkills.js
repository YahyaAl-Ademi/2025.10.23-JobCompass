import { extractCVskills } from "../services/skillsExtractionService.js";
import { logError } from "../util/logging.js";

/**
 * Controller for extracting skills from a resume using AI
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export default async function extractSkills(req, res) {
  try {
    const { resume } = req.body;

    // Validate input
    if (!resume || typeof resume !== "string" || !resume.trim()) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide 'resume' (non-empty string) in the request body.",
      });
    }

    // Extract skills using OpenAI
    const skills = await extractCVskills(resume);

    // Return the extracted skills
    return res.status(200).json({
      success: true,
      skills,
      msg: "Skills extracted successfully",
    });
  } catch (error) {
    logError(error);

    // Handle specific error cases
    if (error.message === "We were unable to generate the skills") {
      return res.status(500).json({
        success: false,
        msg: error.message,
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      msg: "An error occurred while extracting skills from the resume",
    });
  }
}
