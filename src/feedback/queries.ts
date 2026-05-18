/**
 * Feedback GraphQL Queries and Operations
 */

import type { GraphQLClient } from "../shared/client.js";
import type { LaunchNotesFeedback, LaunchNotesFeedbackListItem, SearchFeedbackFilters } from "./types.js";

// GraphQL query strings
export const SEARCH_FEEDBACK_QUERY = `
  query SearchFeedback(
    $projectId: ID!,
    $searchTerm: String,
    $reaction: Reaction,
    $importance: Importance,
    $organizedState: String,
    $starred: Boolean,
    $archived: Boolean,
    $first: Int,
    $after: String
  ) {
    project(id: $projectId) {
      feedbacks(
        searchTerm: $searchTerm,
        reaction: $reaction,
        importance: $importance,
        organizedState: $organizedState,
        starred: $starred,
        archived: $archived,
        first: $first,
        after: $after
      ) {
        nodes {
          id
          content
          reaction
          importance
          starred
          archived
          createdAt
          affectedCustomer {
            id
            email
            initials
          }
          reporter {
            id
            email
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_FEEDBACK_QUERY = `
  query GetFeedback($id: ID!) {
    feedback(id: $id) {
      id
      content
      notes
      reaction
      importance
      starred
      archived
      createdAt
      updatedAt
      affectedCustomer {
        id
        email
        initials
        confirmedAt
      }
      reporter {
        id
        email
      }
      feedbackable {
        ... on Announcement {
          id
          __typename
          name: headline
        }
        ... on Idea {
          id
          __typename
        }
        ... on WorkItem {
          id
          __typename
        }
      }
    }
  }
`;

// Operation functions
export async function searchFeedback(
  client: GraphQLClient,
  filters: SearchFeedbackFilters,
  toolName?: string
): Promise<{
  project: {
    feedbacks: {
      nodes: LaunchNotesFeedbackListItem[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor?: string;
      };
    };
  };
}> {
  return client.execute(
    SEARCH_FEEDBACK_QUERY,
    {
      projectId: filters.projectId,
      searchTerm: filters.query,
      reaction: filters.reaction,
      importance: filters.importance,
      organizedState: filters.organizedState,
      starred: filters.starred,
      archived: filters.archived,
      first: filters.first || 20,
      after: filters.after,
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function getFeedback(
  client: GraphQLClient,
  feedbackId: string,
  toolName?: string
): Promise<{
  feedback: LaunchNotesFeedback;
}> {
  return client.execute(
    GET_FEEDBACK_QUERY,
    { id: feedbackId },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}
