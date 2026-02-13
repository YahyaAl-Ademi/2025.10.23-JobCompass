import { z } from "zod";

// Define the schema for a single skill: must contain only letters, numbers, spaces, and -/#+
const skillSchema = z
  .string()
  .regex(/^[a-zA-Z0-9\s\-/+#+]+$/, {
    message: "Skill must contain only letters, numbers, spaces, and -/#+",
  })
  .min(1, "Skill cannot be empty");

// Define the schema for the array of skills
export const generatedSkillsSchema = z.object({
  skills: z.array(skillSchema).min(0),
});
