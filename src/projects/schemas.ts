/**
 * Zod Schemas for Project Tools
 */

import { z } from "zod";
import { RESPONSE_FORMAT } from "../shared/constants.js";

/**
 * Hex color validation
 */
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)")
  .describe("Hex color code");

/**
 * Response format enum
 */
const responseFormatSchema = z
  .enum([RESPONSE_FORMAT.JSON, RESPONSE_FORMAT.MARKDOWN])
  .default(RESPONSE_FORMAT.MARKDOWN)
  .describe("Output format: 'json' for structured data, 'markdown' for human-readable");

/**
 * Schema for launchnotes_get_project
 */
export const GetProjectSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project to retrieve"),
    response_format: responseFormatSchema,
  })
  .strict();

export type GetProjectInput = z.infer<typeof GetProjectSchema>;

/**
 * Schema for launchnotes_list_projects
 */
export const ListProjectsSchema = z
  .object({
    response_format: responseFormatSchema,
  })
  .strict();

export type ListProjectsInput = z.infer<typeof ListProjectsSchema>;

/**
 * Schema for launchnotes_update_project_custom_code
 */
export const UpdateProjectCustomCodeSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project to update"),
    custom_css: z
      .string()
      .optional()
      .describe("Custom CSS code to apply to the project"),
    custom_head: z
      .string()
      .optional()
      .describe("Custom HTML to inject into the <head> section"),
    custom_header: z
      .string()
      .optional()
      .describe("Custom HTML for the page header"),
    custom_footer: z
      .string()
      .optional()
      .describe("Custom HTML for the page footer"),
    custom_index_hero: z
      .string()
      .optional()
      .describe("Custom HTML for the index page hero section"),
  })
  .strict()
  .refine(
    (data) =>
      data.custom_css !== undefined ||
      data.custom_head !== undefined ||
      data.custom_header !== undefined ||
      data.custom_footer !== undefined ||
      data.custom_index_hero !== undefined,
    {
      message: "At least one custom code field must be provided",
    }
  );

export type UpdateProjectCustomCodeInput = z.infer<typeof UpdateProjectCustomCodeSchema>;

/**
 * Schema for launchnotes_update_project_colors
 */
export const UpdateProjectColorsSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project to update"),
    primary_color: hexColorSchema.optional(),
    secondary_color: hexColorSchema.optional(),
    gray_color: hexColorSchema.optional(),
    light_gray_color: hexColorSchema.optional(),
    off_white_color: hexColorSchema.optional(),
    white_color: hexColorSchema.optional(),
    primary_text_color: hexColorSchema.optional(),
    secondary_text_color: hexColorSchema.optional(),
    supporting_palette: z
      .string()
      .optional()
      .describe("Supporting color palette configuration"),
    color_theme: z
      .string()
      .optional()
      .describe("Overall color theme identifier"),
  })
  .strict()
  .refine(
    (data) =>
      data.primary_color !== undefined ||
      data.secondary_color !== undefined ||
      data.gray_color !== undefined ||
      data.light_gray_color !== undefined ||
      data.off_white_color !== undefined ||
      data.white_color !== undefined ||
      data.primary_text_color !== undefined ||
      data.secondary_text_color !== undefined ||
      data.supporting_palette !== undefined ||
      data.color_theme !== undefined,
    {
      message: "At least one color field must be provided",
    }
  );

export type UpdateProjectColorsInput = z.infer<typeof UpdateProjectColorsSchema>;

/**
 * Schema for launchnotes_update_project_content
 */
export const UpdateProjectContentSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project to update"),
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .optional()
      .describe("Internal project name"),
    title: z
      .string()
      .min(1, "Title cannot be empty")
      .optional()
      .describe("Public-facing project title"),
    description: z
      .string()
      .optional()
      .describe("Project description"),
    heading: z
      .string()
      .optional()
      .describe("Main heading displayed on the project page"),
    subheading: z
      .string()
      .optional()
      .describe("Subheading displayed below the main heading"),
    slug: z
      .string()
      .min(1, "Slug cannot be empty")
      .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
      .optional()
      .describe("URL-friendly project identifier"),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.title !== undefined ||
      data.description !== undefined ||
      data.heading !== undefined ||
      data.subheading !== undefined ||
      data.slug !== undefined,
    {
      message: "At least one content field must be provided",
    }
  );

export type UpdateProjectContentInput = z.infer<typeof UpdateProjectContentSchema>;

/**
 * Schema for launchnotes_update_project_features
 */
export const UpdateProjectFeaturesSchema = z
  .object({
    project_id: z
      .string()
      .min(1, "Project ID is required")
      .describe("The ID of the LaunchNotes project to update"),
    feedback_enabled: z
      .boolean()
      .optional()
      .describe("Enable or disable feedback collection"),
    roadmap_enabled: z
      .boolean()
      .optional()
      .describe("Enable or disable the roadmap feature"),
    ideas_enabled: z
      .boolean()
      .optional()
      .describe("Enable or disable the ideas/feature request feature"),
    rss_feed_enabled: z
      .boolean()
      .optional()
      .describe("Enable or disable RSS feed"),
    voting_enabled: z
      .boolean()
      .optional()
      .describe("Enable or disable voting on ideas"),
    noindex: z
      .boolean()
      .optional()
      .describe("Prevent search engines from indexing the project"),
  })
  .strict()
  .refine(
    (data) =>
      data.feedback_enabled !== undefined ||
      data.roadmap_enabled !== undefined ||
      data.ideas_enabled !== undefined ||
      data.rss_feed_enabled !== undefined ||
      data.voting_enabled !== undefined ||
      data.noindex !== undefined,
    {
      message: "At least one feature toggle must be provided",
    }
  );

export type UpdateProjectFeaturesInput = z.infer<typeof UpdateProjectFeaturesSchema>;
