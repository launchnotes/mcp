/**
 * LaunchNotes Roadmap Tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GraphQLClient } from "../shared/client.js";
import { RESPONSE_FORMAT } from "../shared/constants.js";
import { listStages, listWorkItems, repositionWorkItem, createWorkItem } from "./queries.js";
import {
  formatStageListMarkdown,
  formatWorkItemListMarkdown,
  formatMoveWorkItemMarkdown,
  formatCreateWorkItemMarkdown,
} from "./formatters.js";
import {
  ListStagesSchema,
  ListWorkItemsSchema,
  MoveWorkItemSchema,
  CreateWorkItemSchema,
  type ListStagesInput,
  type ListWorkItemsInput,
  type MoveWorkItemInput,
  type CreateWorkItemInput,
} from "./schemas.js";

export function registerRoadmapTools(server: McpServer, client: GraphQLClient): void {
  server.registerTool(
    "launchnotes_list_stages",
    {
      title: "List Roadmap Stages",
      description: `List the roadmap stages for a LaunchNotes project, in their on-roadmap order.

Stages are the columns of the public roadmap (e.g. "In planning", "In development", "Complete"). Use this to discover the target_stage_id parameter accepted by launchnotes_move_work_item.

Args:
  - project_id (string): The ID of the LaunchNotes project
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  List of stages with id, name, and position (0-indexed from left to right on the roadmap). Up to 100 stages.

Use Cases:
  - "What stages does my roadmap have?"
  - "Find the 'Shipped' stage ID so I can move a work item there"

Error Handling:
  - Returns "Project not found" if the project ID doesn't exist
  - Returns "Authentication failed" if the API token is invalid`,
      inputSchema: ListStagesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListStagesInput) => {
      try {
        const result = await listStages(client, params.project_id, "launchnotes_list_stages");
        const stages = [...result.project.stages.nodes].sort((a, b) => a.position - b.position);

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ total: stages.length, stages }, null, 2),
              },
            ],
          };
        }

        return {
          content: [{ type: "text", text: formatStageListMarkdown(stages) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error listing stages: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "launchnotes_list_work_items",
    {
      title: "List Roadmap Work Items",
      description: `List the non-archived work items on a LaunchNotes project's roadmap, optionally filtered to a single stage.

Work items are the cards on the public roadmap. Each one lives in a single stage. Use this to discover the work_item_id parameter accepted by launchnotes_move_work_item.

Args:
  - project_id (string): The ID of the LaunchNotes project
  - stage_id (string, optional): If provided, only work items in this stage are returned
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  List of work items with id, name, stage_id, and position within their stage. Up to 100 items. Archived work items are excluded.

Use Cases:
  - "What's on the roadmap?"
  - "Show me everything currently in development"
  - "Find the work item named 'Auth feature' so I can move it"

Error Handling:
  - Returns "Project not found" if the project ID doesn't exist
  - Returns "Authentication failed" if the API token is invalid`,
      inputSchema: ListWorkItemsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListWorkItemsInput) => {
      try {
        const result = await listWorkItems(
          client,
          params.project_id,
          "launchnotes_list_work_items"
        );
        let items = result.project.workItems.nodes;
        if (params.stage_id) {
          items = items.filter((w) => w.stageId === params.stage_id);
        }
        items = [...items].sort((a, b) => a.position - b.position);

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ total: items.length, work_items: items }, null, 2),
              },
            ],
          };
        }

        return {
          content: [{ type: "text", text: formatWorkItemListMarkdown(items) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error listing work items: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "launchnotes_move_work_item",
    {
      title: "Move a Work Item Between Stages",
      description: `Move a work item between roadmap stages. Does NOT send any subscriber notification — that's a separate operation (createWorkItemMovedUpdate) intentionally not exposed in this slim version.

The work item is appended to the bottom of the target stage. Use launchnotes_list_work_items to discover work_item_id and launchnotes_list_stages to discover target_stage_id.

Args:
  - work_item_id (string): The ID of the work item to move
  - target_stage_id (string): The ID of the stage to move it into

Returns:
  Confirmation including the work item's name and the source/target stage names.

Use Cases:
  - "Move the auth feature to Shipped"
  - "Drop the API redesign back into Planning"

Error Handling:
  - Returns "Work item not found" if the work_item_id is invalid
  - Returns "Stage not found" if the target_stage_id is invalid
  - Returns "Authentication failed" if the API token is invalid (this mutation requires a Management token)`,
      inputSchema: MoveWorkItemSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: MoveWorkItemInput) => {
      try {
        const result = await repositionWorkItem(
          client,
          params.work_item_id,
          params.target_stage_id,
          "launchnotes_move_work_item"
        );

        if (result.repositionWorkItem.errors && result.repositionWorkItem.errors.length > 0) {
          const messages = result.repositionWorkItem.errors.map((e) => e.message).join(", ");
          throw new Error(messages);
        }

        const { workItem, sourceStage, targetStage } = result.repositionWorkItem;

        return {
          content: [
            {
              type: "text",
              text: formatMoveWorkItemMarkdown({
                workItemName: workItem?.name ?? params.work_item_id,
                sourceStageName: sourceStage?.name,
                targetStageName: targetStage?.name ?? params.target_stage_id,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error moving work item: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "launchnotes_create_work_item",
    {
      title: "Create Roadmap Work Item",
      description: `Create a new work item on the LaunchNotes roadmap.

Work items are features or initiatives displayed on your public roadmap. Each work item is added to a specific stage (column).

Args:
  - project_id (string): The ID of the LaunchNotes project
  - name (string): The name/title of the work item (required)
  - stage_id (string): The ID of the stage to add the work item to (required)
  - content_markdown (string, optional): Description/content in Markdown format
  - owner_id (string, optional): The ID of the user who owns this work item

Returns:
  Created work item with ID, name, stage ID, and creation timestamp

Use Cases:
  - "Create a work item for the new authentication feature"
  - "Add 'Mobile app redesign' to the roadmap in the Planning stage"
  - "Create a work item with detailed markdown description"

Error Handling:
  - Returns validation errors if required fields are missing
  - Returns "Project not found" if project ID doesn't exist
  - Returns "Stage not found" if stage ID is invalid
  - Returns "Authentication failed" if API token lacks permission (requires Management token)`,
      inputSchema: CreateWorkItemSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: CreateWorkItemInput) => {
      try {
        const attributes: Record<string, unknown> = {
          name: params.name,
          stageId: params.stage_id,
        };

        if (params.content_markdown !== undefined) {
          attributes.contentMarkdown = params.content_markdown;
        }
        if (params.owner_id !== undefined) {
          attributes.ownerId = params.owner_id;
        }

        const result = await createWorkItem(
          client,
          attributes,
          "launchnotes_create_work_item"
        );

        if (result.createWorkItem.errors && result.createWorkItem.errors.length > 0) {
          const errorMessages = result.createWorkItem.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const workItem = result.createWorkItem.workItem;

        if (!workItem) {
          throw new Error("Work item creation failed without error details");
        }

        return {
          content: [
            {
              type: "text",
              text: formatCreateWorkItemMarkdown(workItem),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error creating work item: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
