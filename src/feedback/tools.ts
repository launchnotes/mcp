/**
 * LaunchNotes Feedback Tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GraphQLClient } from "../shared/client.js";
import { RESPONSE_FORMAT } from "../shared/constants.js";
import { searchFeedback, getFeedback } from "./queries.js";
import { formatFeedbackMarkdown, formatFeedbackListMarkdown } from "./formatters.js";
import {
  SearchFeedbackSchema,
  GetFeedbackSchema,
  type SearchFeedbackInput,
  type GetFeedbackInput,
} from "./schemas.js";

/**
 * Register all feedback tools
 */
export function registerFeedbackTools(
  server: McpServer,
  client: GraphQLClient
): void {
  // Tool 1: Search Feedback
  server.registerTool(
    "launchnotes_search_feedback",
    {
      title: "Search LaunchNotes Feedback",
      description: `Search and filter customer feedback in a LaunchNotes project.

Args:
  - project_id (string): The ID of the project (required)
  - query (string, optional): Search term to find in feedback content
  - reaction ('happy' | 'meh' | 'sad', optional): Filter by customer sentiment
  - importance ('low' | 'medium' | 'high', optional): Filter by importance level
  - organized_state (string, optional): Filter by state ('organized', 'unorganized', 'announcement', 'idea', 'roadmap')
  - starred (boolean, optional): Filter by starred status
  - archived (boolean, optional): Filter by archived status
  - limit (number, optional): Number to return (max 100, default: 20)
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  List of feedback items with content, sentiment, importance, customer info, and timestamps

Use Cases:
  - "What are customers saying about Digests?"
  - "Show me all unhappy feedback"
  - "Find high importance feedback that's unorganized"
  - "Search feedback containing 'API integration'"
  - "Show me starred feedback"

Error Handling:
  - Returns "Project not found" if project ID doesn't exist
  - Returns "Authentication failed" if API token is invalid`,
      inputSchema: SearchFeedbackSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: SearchFeedbackInput) => {
      try {
        const result = await searchFeedback(client, {
          projectId: params.project_id,
          query: params.query,
          reaction: params.reaction,
          importance: params.importance,
          organizedState: params.organized_state,
          starred: params.starred,
          archived: params.archived,
          first: params.limit,
        }, "launchnotes_search_feedback");

        const feedbacks = result.project.feedbacks.nodes;

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    total: feedbacks.length,
                    feedbacks,
                    hasMore: result.project.feedbacks.pageInfo.hasNextPage,
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
              text: formatFeedbackListMarkdown(feedbacks),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error searching feedback: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 2: Get Feedback
  server.registerTool(
    "launchnotes_get_feedback",
    {
      title: "Get LaunchNotes Feedback Item",
      description: `Retrieve complete details for a specific feedback item including customer info, reporter, and associations.

Args:
  - feedback_id (string): The ID of the feedback item (required)
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  Complete feedback details including:
  - Content and internal notes
  - Sentiment (reaction) and importance
  - Affected customer information
  - Reporter information
  - Associated announcement/idea/work item
  - Timestamps

Use Cases:
  - "Show me details for feedback #abc123"
  - "Get the full context of this feedback item"
  - "What announcement is this feedback associated with?"

Error Handling:
  - Returns "Feedback not found" if ID doesn't exist
  - Returns "Authentication failed" if API token is invalid`,
      inputSchema: GetFeedbackSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetFeedbackInput) => {
      try {
        const result = await getFeedback(client, params.feedback_id, "launchnotes_get_feedback");
        const feedback = result.feedback;

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(feedback, null, 2),
              },
            ],
          };
        }

        // Markdown format
        return {
          content: [
            {
              type: "text",
              text: formatFeedbackMarkdown(feedback),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error retrieving feedback: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
