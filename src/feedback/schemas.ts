/**
 * Zod Schemas for Feedback Tools
 */

import { z } from "zod";
import { RESPONSE_FORMAT } from "../shared/constants.js";

/**
 * Response format enum
 */
const responseFormatSchema = z
  .enum([RESPONSE_FORMAT.JSON, RESPONSE_FORMAT.MARKDOWN])
  .default(RESPONSE_FORMAT.MARKDOWN)
  .describe("Output format: 'json' for structured data, 'markdown' for human-readable");

/**
 * Feedback reaction enum
 */
const reactionSchema = z
  .enum(["happy", "meh", "sad"])
  .optional()
  .describe("Filter by customer reaction/sentiment");

/**
 * Feedback importance enum
 */
const importanceSchema = z
  .enum(["low", "medium", "high"])
  .optional()
  .describe("Filter by importance level");

/**
 * Schema for launchnotes_search_feedback
 */
export const SearchFeedbackSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project"),
    query: z
      .string()
      .optional()
      .describe("Search term to find in feedback content"),
    reaction: reactionSchema,
    importance: importanceSchema,
    organized_state: z
      .string()
      .optional()
      .describe("Filter by organized state: 'organized', 'unorganized', 'announcement', 'idea', 'roadmap'"),
    starred: z
      .boolean()
      .optional()
      .describe("Filter by starred status"),
    archived: z
      .boolean()
      .optional()
      .describe("Filter by archived status"),
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(20)
      .optional()
      .describe("Number of feedback items to return (max 100)"),
    response_format: responseFormatSchema,
  })
  .strict();

export type SearchFeedbackInput = z.infer<typeof SearchFeedbackSchema>;

/**
 * Schema for launchnotes_get_feedback
 */
export const GetFeedbackSchema = z
  .object({
    feedback_id: z
      .string()
      .min(1, "Feedback ID is required")
      .describe("The ID of the feedback item to retrieve"),
    response_format: responseFormatSchema,
  })
  .strict();

export type GetFeedbackInput = z.infer<typeof GetFeedbackSchema>;
