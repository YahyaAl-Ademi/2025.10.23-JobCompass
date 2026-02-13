import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Converts a Zod schema to a format suitable for OpenAI's structured output
 * @param {import('zod').ZodType} schema - The Zod schema to convert
 * @param {string} name - The name for the structured output
 * @returns {object} The formatted schema for OpenAI
 */
export function zodTextFormat(schema, name = "structured_output") {
  const jsonSchema = zodToJsonSchema(schema, name);

  return {
    type: "json_schema",
    json_schema: {
      name,
      strict: true,
      schema: jsonSchema,
    },
  };
}
