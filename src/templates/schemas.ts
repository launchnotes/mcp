/**
 * Zod Schemas for Template Tools
 */

import { z } from "zod";
import { RESPONSE_FORMAT } from "../shared/constants.js";

const responseFormatSchema = z
  .enum([RESPONSE_FORMAT.JSON, RESPONSE_FORMAT.MARKDOWN])
  .default(RESPONSE_FORMAT.MARKDOWN)
  .describe("Output format: 'json' for structured data, 'markdown' for human-readable");

/**
 * Schema for launchnotes_list_templates
 */
export const ListTemplatesSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project"),
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .optional()
      .describe("Number of templates to return (max 100, default 50)"),
    response_format: responseFormatSchema,
  })
  .strict();

export type ListTemplatesInput = z.infer<typeof ListTemplatesSchema>;
