/**
 * Zod Schemas for Announcement Tools
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
 * Announcement state enum
 */
const announcementStateSchema = z
  .enum(["draft", "scheduled", "published", "archived"])
  .optional()
  .describe("Filter by announcement state");

/**
 * Schema for launchnotes_list_announcements
 */
export const ListAnnouncementsSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project"),
    state: announcementStateSchema,
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .optional()
      .describe("Number of announcements to return (max 100)"),
    response_format: responseFormatSchema,
  })
  .strict();

export type ListAnnouncementsInput = z.infer<typeof ListAnnouncementsSchema>;

/**
 * Schema for launchnotes_get_announcement
 */
export const GetAnnouncementSchema = z
  .object({
    announcement_id: z
      .string()
      .min(1, "Announcement ID is required")
      .describe("The ID of the announcement to retrieve"),
    response_format: responseFormatSchema,
  })
  .strict();

export type GetAnnouncementInput = z.infer<typeof GetAnnouncementSchema>;

/**
 * Schema for launchnotes_create_announcement
 */
export const CreateAnnouncementSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project"),
    headline: z
      .string()
      .min(1, "Headline is required")
      .describe("The main headline/title of the announcement"),
    content_markdown: z
      .string()
      .optional()
      .describe("The full content/body of the announcement in Markdown format"),
    content_html: z
      .string()
      .optional()
      .describe("The full content/body of the announcement in HTML format"),
    content_jira: z
      .string()
      .optional()
      .describe("The full content/body of the announcement in Jira Wiki Syntax"),
  })
  .strict();

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;

/**
 * Schema for launchnotes_update_announcement
 */
export const UpdateAnnouncementSchema = z
  .object({
    announcement_id: z
      .string()
      .min(1, "Announcement ID is required")
      .describe("The ID of the announcement to update"),
    headline: z
      .string()
      .min(1, "Headline cannot be empty")
      .optional()
      .describe("The main headline/title of the announcement"),
    content: z
      .string()
      .optional()
      .describe("The full content/body of the announcement in JSON format (LaunchNotes rich text format)"),
    title: z
      .string()
      .optional()
      .describe("SEO title"),
    description: z
      .string()
      .optional()
      .describe("Meta description for SEO"),
    excerpt: z
      .string()
      .optional()
      .describe("Short excerpt or summary"),
    category_ids: z
      .array(z.string())
      .optional()
      .describe("Array of category IDs to assign"),
    change_type_ids: z
      .array(z.string())
      .optional()
      .describe("Array of change type (label) IDs to assign"),
  })
  .strict()
  .refine(
    (data) =>
      data.headline !== undefined ||
      data.content !== undefined ||
      data.title !== undefined ||
      data.description !== undefined ||
      data.excerpt !== undefined ||
      data.category_ids !== undefined ||
      data.change_type_ids !== undefined,
    {
      message: "At least one field must be provided to update",
    }
  );

export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementSchema>;

/**
 * Schema for launchnotes_publish_announcement
 */
export const PublishAnnouncementSchema = z
  .object({
    announcement_id: z
      .string()
      .min(1, "Announcement ID is required")
      .describe("The ID of the announcement to publish"),
  })
  .strict();

export type PublishAnnouncementInput = z.infer<typeof PublishAnnouncementSchema>;

/**
 * Schema for launchnotes_schedule_announcement
 */
export const ScheduleAnnouncementSchema = z
  .object({
    announcement_id: z
      .string()
      .min(1, "Announcement ID is required")
      .describe("The ID of the announcement to schedule"),
    scheduled_at: z
      .string()
      .refine(
        (val) => {
          try {
            const date = new Date(val);
            return !isNaN(date.getTime()) && date > new Date();
          } catch {
            return false;
          }
        },
        {
          message: "Must be a valid future ISO 8601 date-time string",
        }
      )
      .describe("When to publish the announcement (ISO 8601 format, must be in the future)"),
    scheduled_at_timezone: z
      .string()
      .optional()
      .describe("Timezone for the scheduled time (e.g., 'America/New_York', 'UTC'). Defaults to UTC if not provided."),
  })
  .strict();

export type ScheduleAnnouncementInput = z.infer<typeof ScheduleAnnouncementSchema>;

/**
 * Schema for launchnotes_archive_announcement
 */
export const ArchiveAnnouncementSchema = z
  .object({
    announcement_id: z
      .string()
      .min(1, "Announcement ID is required")
      .describe("The ID of the announcement to archive"),
  })
  .strict();

export type ArchiveAnnouncementInput = z.infer<typeof ArchiveAnnouncementSchema>;
