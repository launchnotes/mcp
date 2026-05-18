/**
 * LaunchNotes Template Tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GraphQLClient } from "../shared/client.js";
import { RESPONSE_FORMAT } from "../shared/constants.js";
import { listTemplates } from "./queries.js";
import { formatTemplateListMarkdown } from "./formatters.js";
import {
  ListTemplatesSchema,
  type ListTemplatesInput,
} from "./schemas.js";

/**
 * Register all template tools
 */
export function registerTemplateTools(server: McpServer, client: GraphQLClient): void {
  server.registerTool(
    "launchnotes_list_templates",
    {
      title: "List LaunchNotes Templates",
      description: `List announcement templates for a LaunchNotes project, sorted alphabetically by name.

Templates are reusable scaffolds for announcements — they carry the structure and voice that new announcements inherit. Use this to discover the template_id parameter accepted by launchnotes_create_announcement.

Args:
  - project_id (string): The ID of the LaunchNotes project
  - limit (number, optional): Number of templates to return (max 100, default 50)
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  List of templates with id, name, headline, description — sorted A→Z by name. Archived templates are excluded.

Use Cases:
  - "What templates are available on my project?"
  - "Find the Feature Launch template, then create an announcement from it"
  - "List all the announcement templates"

Error Handling:
  - Returns "Project not found" if the project ID doesn't exist
  - Returns "Authentication failed" if the API token is invalid`,
      inputSchema: ListTemplatesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListTemplatesInput) => {
      try {
        const result = await listTemplates(client, params.project_id, params.limit);
        const templates = [...result.project.templates.nodes].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    total: templates.length,
                    templates,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: formatTemplateListMarkdown(templates),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error listing templates: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
