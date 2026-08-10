/**
 * LaunchNotes External Content Link Tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GraphQLClient } from "../shared/client.js";
import { createExternalContentLink } from "./queries.js";
import {
  CreateExternalContentLinkSchema,
  type CreateExternalContentLinkInput,
} from "./schemas.js";

/**
 * Register all external content link tools
 */
export function registerLinkTools(server: McpServer, client: GraphQLClient): void {
  server.registerTool(
    "launchnotes_create_external_content_link",
    {
      title: "Attach Link to LaunchNotes Announcement",
      description: `Attach a supporting link to a LaunchNotes announcement. The link appears in the announcement's sidebar for readers (e.g., blog post, docs, demo video).

Designed for the drafting flow: create an announcement, then attach one or more supporting links to it before publishing.

Args:
  - owner_id (string): The ID of the announcement the link should attach to
  - title (string): Display label for the link (e.g., "Read the blog post")
  - url (string): The full URL the link points to (must include https://)

Returns:
  Success confirmation, or a list of validation errors.

Note: The mutation does not echo back a link ID. If you need to update or delete the link later, you'll need to attach links during the same drafting session — read-back is not supported in this version.

Use Cases:
  - "Attach the blog post URL to the announcement I just created"
  - "Add a 'View the docs' link to the v2 launch announcement"
  - "Link the demo video to this announcement"

Error Handling:
  - Returns validation errors if owner_id is invalid or URL is malformed
  - Returns "Authentication failed" if the API token is invalid`,
      inputSchema: CreateExternalContentLinkSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: CreateExternalContentLinkInput) => {
      try {
        const result = await createExternalContentLink(
          client,
          params.owner_id,
          params.title,
          params.url,
          "launchnotes_create_external_content_link"
        );

        const errors = result.createExternalContentLink.errors;
        if (errors && errors.length > 0) {
          const errorMessages = errors.map((e) => e.message).join("; ");
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Failed to attach link: ${errorMessages}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `✓ Attached link "${params.title}" (${params.url}) to ${params.owner_id}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error attaching link: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
