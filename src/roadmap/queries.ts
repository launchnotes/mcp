/**
 * Roadmap GraphQL Queries and Operations
 */

import type { GraphQLClient } from "../shared/client.js";
import type { LaunchNotesStage, LaunchNotesWorkItem } from "./types.js";

export const LIST_STAGES_QUERY = `
  query ListStages($projectId: ID!) {
    project(id: $projectId) {
      stages(first: 100) {
        nodes {
          id
          name
          position
        }
      }
    }
  }
`;

export const LIST_WORK_ITEMS_QUERY = `
  query ListWorkItems($projectId: ID!) {
    project(id: $projectId) {
      workItems(first: 100, archived: false) {
        nodes {
          id
          name
          position
          stageId
        }
      }
    }
  }
`;

export const REPOSITION_WORK_ITEM_MUTATION = `
  mutation RepositionWorkItem($input: RepositionWorkItemInput!) {
    repositionWorkItem(input: $input) {
      workItem {
        id
        name
        stageId
        position
      }
      sourceStage {
        id
        name
      }
      targetStage {
        id
        name
      }
      errors {
        message
        path
      }
    }
  }
`;

export async function listStages(
  client: GraphQLClient,
  projectId: string,
  toolName?: string
): Promise<{
  project: {
    stages: {
      nodes: LaunchNotesStage[];
    };
  };
}> {
  return client.execute(
    LIST_STAGES_QUERY,
    { projectId },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function listWorkItems(
  client: GraphQLClient,
  projectId: string,
  toolName?: string
): Promise<{
  project: {
    workItems: {
      nodes: LaunchNotesWorkItem[];
    };
  };
}> {
  return client.execute(
    LIST_WORK_ITEMS_QUERY,
    { projectId },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}

export async function repositionWorkItem(
  client: GraphQLClient,
  workItemId: string,
  targetStageId: string,
  toolName?: string
): Promise<{
  repositionWorkItem: {
    workItem?: {
      id: string;
      name: string;
      stageId: string;
      position: number;
    };
    sourceStage?: {
      id: string;
      name: string;
    };
    targetStage?: {
      id: string;
      name: string;
    };
    errors?: Array<{ message: string; path?: string[] }>;
  };
}> {
  return client.execute(
    REPOSITION_WORK_ITEM_MUTATION,
    {
      input: {
        workItem: {
          id: workItemId,
          targetStageId,
        },
      },
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}
