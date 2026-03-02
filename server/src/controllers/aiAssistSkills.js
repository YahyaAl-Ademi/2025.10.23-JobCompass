import aiGenerateSkills from "../services/aiGenerateSkills.js";
import { logError } from "../util/logging.js";
import { createHttpError } from "../middleware/errorHandler.js";

/**
 * Controller for assisting with AI-based skill generation based on user input
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export default async function aiAssistSkills(req, res, next) {
  const maxPromptLength = 10000;

  try {
    const { isCV, prompt } = req.body;
    if (
      !prompt ||
      typeof isCV !== "boolean" ||
      typeof prompt !== "string" ||
      !prompt.trim() ||
      prompt.length > maxPromptLength
    ) {
      return next(
        createHttpError(
          400,
          `You need to provide 'prompt' (non-empty string up to ${maxPromptLength} characters) and 'isCV' (boolean) in the request body.`,
        ),
      );
    }

    const skills = await aiGenerateSkills(isCV, prompt);
    return res.status(200).json({ success: true, skills, msg: "" });
  } catch (error) {
    logError(error);
    return next(
      createHttpError(
        500,
        "An error occurred while generating skills based on the provided prompt. Please try again later.",
      ),
    );
  }
}
