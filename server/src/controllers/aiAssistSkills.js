import aiGenerateSkills from "../services/aiGenerateSkills.js";
import { logError } from "../util/logging.js";

/**
 * Controller for assisting with AI-based skill generation based on user input
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export default async function aiAssistSkills(req, res) {
  const maxPromptLength = 10000;
  let responseStatus = 200;
  let responseData = { success: true, skills: [], msg: "" };

  try {
    const { isCV, prompt } = req.body;
    if (
      !prompt ||
      typeof isCV !== "boolean" ||
      typeof prompt !== "string" ||
      !prompt.trim() ||
      prompt.length > maxPromptLength
    ) {
      responseStatus = 400;
      responseData = {
        success: false,
        msg: `You need to provide 'prompt' (non-empty string up to ${maxPromptLength} characters) and 'isCV' (boolean) in the request body.`,
      };
    } else {
      const skills = await aiGenerateSkills(isCV, prompt);
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
