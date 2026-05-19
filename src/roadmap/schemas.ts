/**
 * Zod Schemas for Roadmap Tools
 */

import { z } from "zod";
import { RESPONSE_FORMAT } from "../shared/constants.js";

const responseFormatSchema = z
  .enum([RESPONSE_FORMAT.JSON, RESPONSE_FORMAT.MARKDOWN])
  .default(RESPONSE_FORMAT.MARKDOWN)
  .describe("Output format: 'json' for structured data, 'markdown' for human-readable");

/**
 * Schema for launchnotes_list_stages
 */
export const ListStagesSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project"),
    response_format: responseFormatSchema,
  })
  .strict();

export type ListStagesInput = z.infer<typeof ListStagesSchema>;

/**
 * Schema for launchnotes_list_work_items
 */
export const ListWorkItemsSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project"),
    stage_id: z
      .string()
      .min(1)
      .optional()
      .describe("Optional stage ID to filter by"),
    response_format: responseFormatSchema,
  })
  .strict();

export type ListWorkItemsInput = z.infer<typeof ListWorkItemsSchema>;

/**
 * Schema for launchnotes_move_work_item
 */
export const MoveWorkItemSchema = z
  .object({
    work_item_id: z
      .string()
      .min(1, "Work item ID is required")
      .describe("The ID of the work item to move"),
    target_stage_id: z
      .string()
      .min(1, "Target stage ID is required")
      .describe("The ID of the stage to move the work item into"),
  })
  .strict();

export type MoveWorkItemInput = z.infer<typeof MoveWorkItemSchema>;
