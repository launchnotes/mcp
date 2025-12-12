/**
 * Project GraphQL Queries and Operations
 */

import type { GraphQLClient } from "../shared/client.js";
import type { LaunchNotesProject, LaunchNotesProjectList } from "./types.js";

// GraphQL query strings
export const GET_PROJECT_QUERY = `
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      title
      slug
      description
      heading
      subheading
      customCss
      customHead
      customHeader
      customFooter
      customIndexHero
      primaryColor
      secondaryColor
      grayColor
      lightGrayColor
      offWhiteColor
      whiteColor
      primaryTextColor
      secondaryTextColor
      supportingPalette
      colorTheme
      feedbackEnabled
      roadmapEnabled
      ideasEnabled
      rssFeedEnabled
      votingEnabled
      noindex
      publicPageUrl
      rssFeedUrl
      createdAt
      updatedAt
    }
  }
`;

export const LIST_PROJECTS_QUERY = `
  query ListProjects {
    viewer {
      projects {
        nodes {
          id
          name
          slug
          publicPageUrl
        }
      }
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = `
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      project {
        id
        name
        updatedAt
      }
      errors {
        message
        path
      }
    }
  }
`;

// Operation functions
export async function getProject(
  client: GraphQLClient,
  projectId: string
): Promise<{
  project: LaunchNotesProject;
}> {
  return client.execute(GET_PROJECT_QUERY, { id: projectId });
}

export async function listProjects(
  client: GraphQLClient
): Promise<{
  viewer: {
    projects: {
      nodes: LaunchNotesProjectList[];
    };
  };
}> {
  return client.execute(LIST_PROJECTS_QUERY);
}

export async function updateProject(
  client: GraphQLClient,
  projectId: string,
  attributes: Record<string, unknown>
): Promise<{
  updateProject: {
    project?: {
      id: string;
      name: string;
      updatedAt: string;
    };
    errors?: Array<{
      message: string;
      path?: string[];
    }>;
  };
}> {
  return client.execute(UPDATE_PROJECT_MUTATION, {
    input: {
      id: projectId,
      project: attributes,
    },
  });
}
