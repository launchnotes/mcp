/**
 * Template GraphQL Queries and Operations
 */

import type { GraphQLClient } from "../shared/client.js";
import type { LaunchNotesTemplate } from "./types.js";

export const LIST_TEMPLATES_QUERY = `
  query ListTemplates($projectId: ID!, $first: Int) {
    project(id: $projectId) {
      templates(first: $first, archived: false) {
        nodes {
          id
          name
          headline
          description
          excerpt
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export async function listTemplates(
  client: GraphQLClient,
  projectId: string,
  limit?: number
): Promise<{
  project: {
    templates: {
      nodes: LaunchNotesTemplate[];
    };
  };
}> {
  return client.execute(LIST_TEMPLATES_QUERY, {
    projectId,
    first: limit ?? 100,
  });
}
