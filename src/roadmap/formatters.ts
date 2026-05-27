/**
 * Roadmap Formatting Functions
 */

import type { LaunchNotesStage, LaunchNotesWorkItem } from "./types.js";

export function formatStageListMarkdown(stages: LaunchNotesStage[]): string {
  if (stages.length === 0) {
    return "No stages found.";
  }

  const lines = [`# Stages (${stages.length})`, ""];

  stages.forEach((stage) => {
    lines.push(`## ${stage.name}`);
    lines.push(`- **ID:** ${stage.id}`);
    lines.push(`- **Position:** ${stage.position}`);
    lines.push("");
  });

  return lines.join("\n");
}

export function formatWorkItemListMarkdown(items: LaunchNotesWorkItem[]): string {
  if (items.length === 0) {
    return "No work items found.";
  }

  const lines = [`# Work items (${items.length})`, ""];

  items.forEach((item) => {
    lines.push(`## ${item.name}`);
    lines.push(`- **ID:** ${item.id}`);
    lines.push(`- **Stage ID:** ${item.stageId}`);
    lines.push(`- **Position:** ${item.position}`);
    lines.push("");
  });

  return lines.join("\n");
}

export function formatMoveWorkItemMarkdown(args: {
  workItemName: string;
  sourceStageName?: string;
  targetStageName: string;
}): string {
  const from = args.sourceStageName ? `from ${args.sourceStageName} ` : "";
  return `✓ Moved '${args.workItemName}' ${from}→ ${args.targetStageName}.`;
}

export function formatCreateWorkItemMarkdown(workItem: {
  id: string;
  name: string;
  stageId: string;
  createdAt: string;
}): string {
  return `✓ Successfully created work item "${workItem.name}"

**ID:** ${workItem.id}
**Stage ID:** ${workItem.stageId}
**Created:** ${workItem.createdAt}

The work item has been added to the roadmap.`;
}
