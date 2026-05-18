/**
 * Template Formatting Functions
 */

import type { LaunchNotesTemplate } from "./types.js";

/**
 * Format template list as markdown
 */
export function formatTemplateListMarkdown(templates: LaunchNotesTemplate[]): string {
  if (templates.length === 0) {
    return "No templates found.";
  }

  const lines = [
    `# Templates (${templates.length})`,
    "",
  ];

  templates.forEach((template) => {
    lines.push(`## ${template.name}`);
    lines.push(`- **ID:** ${template.id}`);
    if (template.headline) {
      lines.push(`- **Headline:** ${template.headline}`);
    }
    if (template.description) {
      lines.push(`- **Description:** ${template.description}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}
