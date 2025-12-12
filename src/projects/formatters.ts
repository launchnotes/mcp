/**
 * Project Formatting Functions
 */

import type { LaunchNotesProject, LaunchNotesProjectList } from "./types.js";

/**
 * Format project data as markdown
 */
export function formatProjectMarkdown(project: LaunchNotesProject): string {
  const sections: string[] = [];

  // Basic info
  sections.push(`# Project: ${project.name}`);
  sections.push(`**ID:** ${project.id}`);
  sections.push(`**Title:** ${project.title}`);
  sections.push(`**Slug:** ${project.slug}`);
  sections.push(`**URL:** ${project.publicPageUrl}`);

  if (project.description) {
    sections.push(`**Description:** ${project.description}`);
  }
  if (project.heading) {
    sections.push(`**Heading:** ${project.heading}`);
  }
  if (project.subheading) {
    sections.push(`**Subheading:** ${project.subheading}`);
  }

  // Colors
  const colors: string[] = [];
  if (project.primaryColor) colors.push(`- Primary: ${project.primaryColor}`);
  if (project.secondaryColor) colors.push(`- Secondary: ${project.secondaryColor}`);
  if (project.primaryTextColor) colors.push(`- Primary Text: ${project.primaryTextColor}`);
  if (project.secondaryTextColor) colors.push(`- Secondary Text: ${project.secondaryTextColor}`);
  if (project.grayColor) colors.push(`- Gray: ${project.grayColor}`);
  if (project.lightGrayColor) colors.push(`- Light Gray: ${project.lightGrayColor}`);
  if (project.offWhiteColor) colors.push(`- Off White: ${project.offWhiteColor}`);
  if (project.whiteColor) colors.push(`- White: ${project.whiteColor}`);
  if (project.colorTheme) colors.push(`- Theme: ${project.colorTheme}`);

  if (colors.length > 0) {
    sections.push(`\n## Colors\n${colors.join("\n")}`);
  }

  // Custom code
  const customCode: string[] = [];
  if (project.customCss) {
    customCode.push(`### Custom CSS\n\`\`\`css\n${project.customCss.substring(0, 500)}${project.customCss.length > 500 ? "..." : ""}\n\`\`\``);
  }
  if (project.customHead) {
    customCode.push(`### Custom Head\n\`\`\`html\n${project.customHead.substring(0, 500)}${project.customHead.length > 500 ? "..." : ""}\n\`\`\``);
  }
  if (project.customHeader) {
    customCode.push(`### Custom Header\n\`\`\`html\n${project.customHeader.substring(0, 500)}${project.customHeader.length > 500 ? "..." : ""}\n\`\`\``);
  }
  if (project.customFooter) {
    customCode.push(`### Custom Footer\n\`\`\`html\n${project.customFooter.substring(0, 500)}${project.customFooter.length > 500 ? "..." : ""}\n\`\`\``);
  }
  if (project.customIndexHero) {
    customCode.push(`### Custom Index Hero\n\`\`\`html\n${project.customIndexHero.substring(0, 500)}${project.customIndexHero.length > 500 ? "..." : ""}\n\`\`\``);
  }

  if (customCode.length > 0) {
    sections.push(`\n## Custom Code\n${customCode.join("\n\n")}`);
  }

  // Features
  sections.push("\n## Features");
  sections.push(`- Feedback: ${project.feedbackEnabled ? "✓ Enabled" : "✗ Disabled"}`);
  sections.push(`- Roadmap: ${project.roadmapEnabled ? "✓ Enabled" : "✗ Disabled"}`);
  sections.push(`- Ideas: ${project.ideasEnabled ? "✓ Enabled" : "✗ Disabled"}`);
  sections.push(`- RSS Feed: ${project.rssFeedEnabled ? "✓ Enabled" : "✗ Disabled"}`);
  sections.push(`- Voting: ${project.votingEnabled ? "✓ Enabled" : "✗ Disabled"}`);
  sections.push(`- SEO Indexing: ${project.noindex ? "✗ Disabled (noindex)" : "✓ Enabled"}`);

  if (project.rssFeedUrl) {
    sections.push(`\n**RSS Feed URL:** ${project.rssFeedUrl}`);
  }

  sections.push(`\n*Last updated: ${new Date(project.updatedAt).toLocaleString()}*`);

  return sections.join("\n");
}

/**
 * Format project list as markdown
 */
export function formatProjectListMarkdown(projects: LaunchNotesProjectList[]): string {
  if (projects.length === 0) {
    return "No projects found.";
  }

  const lines = [
    `# LaunchNotes Projects (${projects.length})`,
    "",
  ];

  projects.forEach((project) => {
    lines.push(`## ${project.name}`);
    lines.push(`- **ID:** ${project.id}`);
    lines.push(`- **Slug:** ${project.slug}`);
    lines.push(`- **URL:** ${project.publicPageUrl}`);
    lines.push("");
  });

  return lines.join("\n");
}
