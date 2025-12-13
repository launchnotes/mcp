/**
 * LaunchNotes Analytics Tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GraphQLClient } from "../shared/client.js";
import { RESPONSE_FORMAT } from "../shared/constants.js";
import { getTopAnnouncements } from "./queries.js";
import { formatTopAnnouncementsMarkdown } from "./formatters.js";
import {
  GetTopAnnouncementsSchema,
  type GetTopAnnouncementsInput,
} from "./schemas.js";

/**
 * Register all analytics tools
 */
export function registerAnalyticsTools(
  server: McpServer,
  client: GraphQLClient
): void {
  // Tool: Get Top Announcements
  server.registerTool(
    "launchnotes_get_top_announcements",
    {
      title: "Get Top Performing LaunchNotes Announcements",
      description: `Get top-performing announcements ranked by various metrics.

Args:
  - project_id (string): The ID of the project (required)
  - metric (enum, default: 'engagement'): Ranking metric
    - 'engagement' - Total viewers + email opens + clicks (most comprehensive)
    - 'open_rate' - Email open rate (email performance)
    - 'click_rate' - Email click rate (engagement depth)
    - 'feedback_count' - Number of feedback items (customer response)
    - 'feedback_sentiment' - Average sentiment score (customer satisfaction)
  - limit (number, optional): Number of results (max 50, default: 10)
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  Ranked list of announcements with:
  - Announcement details (ID, headline, slug, publish date)
  - Primary metric value
  - All other available metrics (viewers, emails sent, opens, clicks, rates, feedback)

Note: Analytics are cumulative for all time, not filtered by date range.

Use Cases:
  - "Which announcements performed best overall?"
  - "Show me top 5 announcements by email open rate"
  - "What got the most feedback?"
  - "Which announcements had the best sentiment?"

Error Handling:
  - Returns "Project not found" if project ID doesn't exist
  - Returns "Authentication failed" if API token is invalid
  - Returns empty result if no published announcements`,
      inputSchema: GetTopAnnouncementsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetTopAnnouncementsInput) => {
      try {
        const announcements = await getTopAnnouncements(client, {
          projectId: params.project_id,
          metric: params.metric || "engagement",
          limit: params.limit,
        });

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    total: announcements.length,
                    metric: params.metric || "engagement",
                    announcements,
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
              text: formatTopAnnouncementsMarkdown(
                announcements,
                params.metric || "engagement"
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error retrieving top announcements: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
