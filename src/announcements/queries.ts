/**
 * Announcement GraphQL Queries and Operations
 */

import type { GraphQLClient } from "../shared/client.js";
import type { LaunchNotesAnnouncement, LaunchNotesAnnouncementList } from "./types.js";

// GraphQL query strings
export const LIST_ANNOUNCEMENTS_QUERY = `
  query ListAnnouncements($projectId: ID!, $first: Int, $after: String, $state: AnnouncementStateEnum, $orderBy: OrderBy) {
    project(id: $projectId) {
      announcements(first: $first, after: $after, state: $state, orderBy: $orderBy) {
        nodes {
          id
          headline
          state
          publishedAt
          scheduledAt
          slug
          createdAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_ANNOUNCEMENT_QUERY = `
  query GetAnnouncement($id: ID!) {
    announcement(id: $id) {
      id
      headline
      title
      titleWithFallback
      name
      description
      content
      contentHtml
      excerpt
      state
      slug
      publishedAt
      scheduledAt
      createdAt
      updatedAt
      author
      publicPermalink
      privatePermalink
      categories {
        id
        name
        color
      }
    }
  }
`;

export const CREATE_ANNOUNCEMENT_MUTATION = `
  mutation CreateAnnouncement($input: CreateAnnouncementInput!) {
    createAnnouncement(input: $input) {
      announcement {
        id
        headline
        state
        createdAt
      }
      errors {
        message
        path
      }
    }
  }
`;

export const UPDATE_ANNOUNCEMENT_MUTATION = `
  mutation UpdateAnnouncement($input: UpdateAnnouncementInput!) {
    updateAnnouncement(input: $input) {
      announcement {
        id
        headline
        updatedAt
      }
      errors {
        message
        path
      }
    }
  }
`;

export const PUBLISH_ANNOUNCEMENT_MUTATION = `
  mutation PublishAnnouncement($input: PublishAnnouncementInput!) {
    publishAnnouncement(input: $input) {
      announcement {
        id
        headline
        state
        publishedAt
      }
      errors {
        message
        path
      }
    }
  }
`;

export const SCHEDULE_ANNOUNCEMENT_MUTATION = `
  mutation ScheduleAnnouncement($input: ScheduleAnnouncementInput!) {
    scheduleAnnouncement(input: $input) {
      announcement {
        id
        headline
        state
        scheduledAt
      }
      errors {
        message
        path
      }
    }
  }
`;

export const ARCHIVE_ANNOUNCEMENT_MUTATION = `
  mutation ArchiveAnnouncement($input: ArchiveAnnouncementInput!) {
    archiveAnnouncement(input: $input) {
      announcement {
        id
        headline
        state
      }
      errors {
        message
        path
      }
    }
  }
`;

// Operation functions
export async function listAnnouncements(
  client: GraphQLClient,
  projectId: string,
  filters?: {
    state?: string;
    first?: number;
    after?: string;
    orderByField?: string;
    orderByDirection?: string;
  },
  toolName?: string
): Promise<{
  project: {
    announcements: {
      nodes: LaunchNotesAnnouncementList[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor?: string;
      };
    };
  };
}> {
  const variables: Record<string, unknown> = {
    projectId,
    first: filters?.first || 50,
    after: filters?.after,
  };

  // Add state filter if provided
  if (filters?.state) {
    variables.state = filters.state;
  }

  // Add orderBy if field and direction are provided
  if (filters?.orderByField && filters?.orderByDirection) {
    variables.orderBy = {
      field: filters.orderByField,
      sort: filters.orderByDirection,
    };
  }

  return client.execute(
    LIST_ANNOUNCEMENTS_QUERY,
    variables,
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function getAnnouncement(
  client: GraphQLClient,
  announcementId: string,
  toolName?: string
): Promise<{
  announcement: LaunchNotesAnnouncement;
}> {
  return client.execute(
    GET_ANNOUNCEMENT_QUERY,
    { id: announcementId },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function createAnnouncement(
  client: GraphQLClient,
  projectId: string,
  attributes: Record<string, unknown>,
  toolName?: string
): Promise<{
  createAnnouncement: {
    announcement?: {
      id: string;
      headline: string;
      state: string;
      createdAt: string;
    };
    errors?: Array<{
      message: string;
      path?: string[];
    }>;
  };
}> {
  return client.execute(
    CREATE_ANNOUNCEMENT_MUTATION,
    {
      input: {
        announcement: {
          projectId,
          ...attributes,
        },
      },
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function updateAnnouncement(
  client: GraphQLClient,
  attributes: Record<string, unknown>,
  toolName?: string
): Promise<{
  updateAnnouncement: {
    announcement?: {
      id: string;
      headline: string;
      updatedAt: string;
    };
    errors?: Array<{
      message: string;
      path?: string[];
    }>;
  };
}> {
  return client.execute(
    UPDATE_ANNOUNCEMENT_MUTATION,
    {
      input: {
        announcement: attributes,
      },
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function publishAnnouncement(
  client: GraphQLClient,
  announcementId: string,
  toolName?: string
): Promise<{
  publishAnnouncement: {
    announcement?: {
      id: string;
      headline: string;
      state: string;
      publishedAt?: string;
    };
    errors?: Array<{
      message: string;
      path?: string[];
    }>;
  };
}> {
  return client.execute(
    PUBLISH_ANNOUNCEMENT_MUTATION,
    {
      input: {
        announcementId: announcementId,
      },
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function scheduleAnnouncement(
  client: GraphQLClient,
  announcementId: string,
  scheduledAt: string,
  scheduledAtTimezone?: string,
  toolName?: string
): Promise<{
  scheduleAnnouncement: {
    announcement?: {
      id: string;
      headline: string;
      state: string;
      scheduledAt?: string;
    };
    errors?: Array<{
      message: string;
      path?: string[];
    }>;
  };
}> {
  const input: Record<string, string> = {
    announcementId: announcementId,
    scheduledAt: scheduledAt,
  };

  if (scheduledAtTimezone) {
    input.scheduledAtTimezone = scheduledAtTimezone;
  }

  return client.execute(
    SCHEDULE_ANNOUNCEMENT_MUTATION,
    {
      input,
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function archiveAnnouncement(
  client: GraphQLClient,
  announcementId: string,
  toolName?: string
): Promise<{
  archiveAnnouncement: {
    announcement?: {
      id: string;
      headline: string;
      state: string;
    };
    errors?: Array<{
      message: string;
      path?: string[];
    }>;
  };
}> {
  return client.execute(
    ARCHIVE_ANNOUNCEMENT_MUTATION,
    {
      input: {
        announcementId: announcementId,
      },
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}
