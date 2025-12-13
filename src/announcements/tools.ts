/**
 * LaunchNotes Announcement Tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GraphQLClient } from "../shared/client.js";
import { RESPONSE_FORMAT } from "../shared/constants.js";
import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  scheduleAnnouncement,
  archiveAnnouncement,
} from "./queries.js";
import { formatAnnouncementMarkdown, formatAnnouncementListMarkdown } from "./formatters.js";
import {
  ListAnnouncementsSchema,
  GetAnnouncementSchema,
  CreateAnnouncementSchema,
  UpdateAnnouncementSchema,
  PublishAnnouncementSchema,
  ScheduleAnnouncementSchema,
  ArchiveAnnouncementSchema,
  type ListAnnouncementsInput,
  type GetAnnouncementInput,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
  type PublishAnnouncementInput,
  type ScheduleAnnouncementInput,
  type ArchiveAnnouncementInput,
} from "./schemas.js";

/**
 * Register all announcement tools
 */
export function registerAnnouncementTools(
  server: McpServer,
  client: GraphQLClient
): void {
  // Tool 1: List Announcements
  server.registerTool(
    "launchnotes_list_announcements",
    {
      title: "List LaunchNotes Announcements",
      description: `List all announcements in a LaunchNotes project with optional filtering and ordering.

Args:
  - project_id (string): The ID of the project
  - state ('draft' | 'scheduled' | 'published' | 'archived', optional): Filter by state
  - limit (number, optional): Number to return (max 100, default: 50)
  - order_by_field ('publishedAt' | 'createdAt' | 'updatedAt', optional): Field to sort by
  - order_by_direction ('ASC' | 'DESC', optional): Sort direction (ascending or descending)
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  List of announcements with id, headline, state, dates, and slug

Use Cases:
  - "List all announcements in my LaunchNotes project"
  - "Show me all published announcements ordered by published date"
  - "List draft announcements"
  - "Show scheduled announcements sorted by creation date descending"

Note: To use ordering, both order_by_field and order_by_direction must be specified.
Default ordering (when not specified) is by updatedAt descending.

Error Handling:
  - Returns "Project not found" if project ID doesn't exist
  - Returns "Authentication failed" if API token is invalid`,
      inputSchema: ListAnnouncementsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListAnnouncementsInput) => {
      try {
        const result = await listAnnouncements(client, params.project_id, {
          state: params.state,
          first: params.limit,
          orderByField: params.order_by_field,
          orderByDirection: params.order_by_direction,
        });

        const announcements = result.project.announcements.nodes;

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    total: announcements.length,
                    announcements,
                    hasMore: result.project.announcements.pageInfo.hasNextPage,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // Markdown format
        return {
          content: [
            {
              type: "text",
              text: formatAnnouncementListMarkdown(announcements),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error listing announcements: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 2: Get Announcement
  server.registerTool(
    "launchnotes_get_announcement",
    {
      title: "Get LaunchNotes Announcement",
      description: `Retrieve complete details for a specific announcement including content, categories, and metadata.

Args:
  - announcement_id (string): The ID of the announcement
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  Complete announcement details with all fields

Use Cases:
  - "Show me announcement details for ID abc123"
  - "Get the full content of announcement xyz"
  - "What are the categories for this announcement?"

Error Handling:
  - Returns "Announcement not found" if ID doesn't exist
  - Returns "Authentication failed" if API token is invalid`,
      inputSchema: GetAnnouncementSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetAnnouncementInput) => {
      try {
        const result = await getAnnouncement(client, params.announcement_id);
        const announcement = result.announcement;

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(announcement, null, 2),
              },
            ],
          };
        }

        // Markdown format
        return {
          content: [
            {
              type: "text",
              text: formatAnnouncementMarkdown(announcement),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error retrieving announcement: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 3: Create Announcement
  server.registerTool(
    "launchnotes_create_announcement",
    {
      title: "Create LaunchNotes Announcement",
      description: `Create a new draft announcement in a LaunchNotes project. The announcement will be created in draft state.

Args:
  - project_id (string): The ID of the project
  - headline (string): The main headline/title (required)
  - content_markdown (string, optional): Content in Markdown format
  - content_html (string, optional): Content in HTML format
  - content_jira (string, optional): Content in Jira Wiki Syntax

Note: Provide only ONE content format. If multiple are provided, the API will use contentMarkdown > contentHtml > contentJira in order of precedence.

Returns:
  Created announcement with ID, headline, state, and creation timestamp

Use Cases:
  - "Create a new announcement about the API update"
  - "Draft an announcement for the new feature launch"
  - "Create announcement with headline 'v2.0 Released'"

Error Handling:
  - Returns validation errors if required fields are missing
  - Returns "Project not found" if project ID doesn't exist
  - Returns "Authentication failed" if API token lacks permission`,
      inputSchema: CreateAnnouncementSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: CreateAnnouncementInput) => {
      try {
        const attributes: Record<string, unknown> = {
          headline: params.headline,
        };

        if (params.content_markdown !== undefined)
          attributes.contentMarkdown = params.content_markdown;
        if (params.content_html !== undefined)
          attributes.contentHtml = params.content_html;
        if (params.content_jira !== undefined)
          attributes.contentJira = params.content_jira;

        const result = await createAnnouncement(client,
          params.project_id,
          attributes
        );

        if (
          result.createAnnouncement.errors &&
          result.createAnnouncement.errors.length > 0
        ) {
          const errorMessages = result.createAnnouncement.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const announcement = result.createAnnouncement.announcement;

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully created announcement "${announcement?.headline}"\n\n**ID:** ${announcement?.id}\n**State:** ${announcement?.state}\n**Created:** ${announcement?.createdAt}\n\nThe announcement has been created as a draft. Use the publish or schedule tool to make it live.`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error creating announcement: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 4: Update Announcement
  server.registerTool(
    "launchnotes_update_announcement",
    {
      title: "Update LaunchNotes Announcement",
      description: `Update an existing announcement's content, metadata, or categorization.

Args:
  - announcement_id (string): The ID of the announcement to update
  - headline (string, optional): Update the headline/title
  - content (string, optional): Update the content/body (must be in LaunchNotes JSON format, not Markdown)
  - title (string, optional): Update SEO title
  - description (string, optional): Update meta description
  - excerpt (string, optional): Update excerpt/summary
  - category_ids (array, optional): Replace category assignments
  - change_type_ids (array, optional): Replace change type (label) assignments

Note: The 'content' field requires LaunchNotes' internal JSON format. For creating announcements with Markdown, use the create_announcement tool with content_markdown.

At least one field must be provided. Fields not specified will remain unchanged.

Returns:
  Confirmation with updated announcement details

Use Cases:
  - "Update the headline of announcement abc123"
  - "Update the excerpt"
  - "Add categories to announcement xyz"

Error Handling:
  - Returns validation error if no fields provided
  - Returns "Announcement not found" if ID doesn't exist
  - Returns "Authentication failed" if API token lacks permission`,
      inputSchema: UpdateAnnouncementSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: UpdateAnnouncementInput) => {
      try {
        const attributes: Record<string, unknown> = {
          id: params.announcement_id,
        };

        if (params.headline !== undefined)
          attributes.headline = params.headline;
        if (params.content !== undefined) attributes.content = params.content;
        if (params.title !== undefined) attributes.title = params.title;
        if (params.description !== undefined)
          attributes.description = params.description;
        if (params.excerpt !== undefined) attributes.excerpt = params.excerpt;
        if (params.category_ids !== undefined)
          attributes.categoryIds = params.category_ids;
        if (params.change_type_ids !== undefined)
          attributes.changeTypeIds = params.change_type_ids;

        const result = await updateAnnouncement(client, attributes);

        if (
          result.updateAnnouncement.errors &&
          result.updateAnnouncement.errors.length > 0
        ) {
          const errorMessages = result.updateAnnouncement.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const announcement = result.updateAnnouncement.announcement;
        const updatedFields = Object.keys(attributes)
          .filter((k) => k !== "id")
          .join(", ");

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully updated announcement "${announcement?.headline}"\n\n**ID:** ${announcement?.id}\n**Updated fields:** ${updatedFields}\n**Last updated:** ${announcement?.updatedAt}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error updating announcement: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 5: Publish Announcement
  server.registerTool(
    "launchnotes_publish_announcement",
    {
      title: "Publish LaunchNotes Announcement",
      description: `Publish an announcement immediately, making it live and visible to subscribers.

Args:
  - announcement_id (string): The ID of the announcement to publish

Returns:
  Confirmation with published announcement details and publish timestamp

Use Cases:
  - "Publish announcement abc123"
  - "Make this announcement live now"
  - "Publish my draft announcement"

Notes:
  - Announcement must be in draft or scheduled state
  - Subscribers will be notified according to project settings
  - Use schedule_announcement to publish at a future time

Error Handling:
  - Returns error if announcement is already published
  - Returns "Announcement not found" if ID doesn't exist
  - Returns "Authentication failed" if API token lacks permission`,
      inputSchema: PublishAnnouncementSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: PublishAnnouncementInput) => {
      try {
        const result = await publishAnnouncement(client, params.announcement_id);

        if (
          result.publishAnnouncement.errors &&
          result.publishAnnouncement.errors.length > 0
        ) {
          const errorMessages = result.publishAnnouncement.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const announcement = result.publishAnnouncement.announcement;

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully published "${announcement?.headline}"\n\n**ID:** ${announcement?.id}\n**State:** ${announcement?.state}\n**Published at:** ${announcement?.publishedAt ? new Date(announcement.publishedAt).toLocaleString() : "Now"}\n\nThe announcement is now live and subscribers have been notified.`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error publishing announcement: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 6: Schedule Announcement
  server.registerTool(
    "launchnotes_schedule_announcement",
    {
      title: "Schedule LaunchNotes Announcement",
      description: `Schedule an announcement to be published automatically at a specific future date and time.

Args:
  - announcement_id (string): The ID of the announcement to schedule
  - scheduled_at (string): When to publish (ISO 8601 format, must be in future)
  - scheduled_at_timezone (string, optional): Timezone (e.g., 'America/New_York', 'UTC'). Defaults to UTC.

Returns:
  Confirmation with scheduled announcement details and scheduled publish time

Use Cases:
  - "Schedule announcement for tomorrow at 9am"
  - "Set announcement to publish on December 25th at noon EST"
  - "Schedule for next Monday at 3pm in New York timezone"

Examples of scheduled_at format:
  - "2025-12-25T12:00:00Z" (UTC time)
  - "2025-12-25T09:00:00-05:00" (EST - with timezone offset)
  - "2025-12-25T09:00:00" with scheduled_at_timezone: "America/New_York"

Notes:
  - Announcement will automatically publish at the scheduled time
  - Subscribers will be notified when it publishes
  - You can reschedule by calling this again with a new time

Error Handling:
  - Returns error if scheduled_at is in the past
  - Returns error if date format is invalid
  - Returns "Announcement not found" if ID doesn't exist`,
      inputSchema: ScheduleAnnouncementSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: ScheduleAnnouncementInput) => {
      try {
        const result = await scheduleAnnouncement(
          client,
          params.announcement_id,
          params.scheduled_at,
          params.scheduled_at_timezone
        );

        if (
          result.scheduleAnnouncement.errors &&
          result.scheduleAnnouncement.errors.length > 0
        ) {
          const errorMessages = result.scheduleAnnouncement.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const announcement = result.scheduleAnnouncement.announcement;

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully scheduled "${announcement?.headline}"\n\n**ID:** ${announcement?.id}\n**State:** ${announcement?.state}\n**Scheduled for:** ${announcement?.scheduledAt ? new Date(announcement.scheduledAt).toLocaleString() : params.scheduled_at}\n\nThe announcement will be automatically published at the scheduled time.`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error scheduling announcement: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 7: Archive Announcement
  server.registerTool(
    "launchnotes_archive_announcement",
    {
      title: "Archive LaunchNotes Announcement",
      description: `Archive an announcement, removing it from the active list while preserving its content.

Args:
  - announcement_id (string): The ID of the announcement to archive

Returns:
  Confirmation with archived announcement details

Use Cases:
  - "Archive old announcement abc123"
  - "Remove announcement from public view"
  - "Archive outdated announcements"

Notes:
  - Archived announcements are no longer visible on the public page
  - Content and data are preserved
  - Can be unarchived later if needed
  - Different from deleting (which would be permanent)

Error Handling:
  - Returns error if announcement is already archived
  - Returns "Announcement not found" if ID doesn't exist
  - Returns "Authentication failed" if API token lacks permission`,
      inputSchema: ArchiveAnnouncementSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: ArchiveAnnouncementInput) => {
      try {
        const result = await archiveAnnouncement(client, params.announcement_id);

        if (
          result.archiveAnnouncement.errors &&
          result.archiveAnnouncement.errors.length > 0
        ) {
          const errorMessages = result.archiveAnnouncement.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const announcement = result.archiveAnnouncement.announcement;

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully archived "${announcement?.headline}"\n\n**ID:** ${announcement?.id}\n**State:** ${announcement?.state}\n\nThe announcement has been removed from public view but its content is preserved.`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error archiving announcement: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
