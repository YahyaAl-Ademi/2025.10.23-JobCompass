import { z } from "zod";

/**
 * Converts a Zod schema to a format suitable for OpenAI's structured output
 * @param {import('zod').ZodType} schema - The Zod schema to convert
 * @param {string} name - The name for the structured output
 * @returns {object} The formatted schema for OpenAI
 */
export function zodTextFormat(schema, name = "structured_output") {
  // Use Zod 4 native JSON schema conversion
  const jsonSchema = z.toJSONSchema(schema);

  // OpenAI Strict mode requirements:
  // 1. No $schema or other meta-fields
  delete jsonSchema.$schema;
  delete jsonSchema.$id;
  delete jsonSchema.definitions;
  delete jsonSchema.$defs;

  return {
    type: "json_schema",
    name,
    strict: true,
    schema: jsonSchema,
  };
}
