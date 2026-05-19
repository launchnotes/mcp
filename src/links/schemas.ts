/**
 * Zod Schemas for External Content Link Tools
 */

import { z } from "zod";

/**
 * Schema for launchnotes_create_external_content_link
 */
export const CreateExternalContentLinkSchema = z
  .object({
    owner_id: z
      .string()
      .min(1, "Owner ID is required")
      .describe(
        "The ID of the announcement (or work item) the link should attach to"
      ),
    title: z
      .string()
      .min(1, "Title is required")
      .describe("Display label for the link (e.g., 'Read the blog post')"),
    url: z
      .string()
      .url("Must be a valid URL")
      .describe("The full URL the link points to (must include https://)"),
  })
  .strict();

export type CreateExternalContentLinkInput = z.infer<
  typeof CreateExternalContentLinkSchema
>;
