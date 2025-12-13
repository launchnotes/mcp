/**
 * Zod Schemas for Analytics Tools
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
 * Analytics metric enum
 */
const metricSchema = z
  .enum(["engagement", "open_rate", "click_rate", "feedback_count", "feedback_sentiment"])
  .default("engagement")
  .describe("Metric to rank by: 'engagement' (total viewers+opens+clicks), 'open_rate', 'click_rate', 'feedback_count', 'feedback_sentiment'");

/**
 * Schema for launchnotes_get_top_announcements
 */
export const GetTopAnnouncementsSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project"),
    metric: metricSchema,
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .optional()
      .describe("Number of top announcements to return (max 50)"),
    response_format: responseFormatSchema,
  })
  .strict();

export type GetTopAnnouncementsInput = z.infer<typeof GetTopAnnouncementsSchema>;
