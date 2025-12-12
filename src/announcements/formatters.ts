/**
 * Announcement Formatting Functions
 */

import type { LaunchNotesAnnouncement, LaunchNotesAnnouncementList } from "./types.js";

/**
 * Format announcement data as markdown
 */
export function formatAnnouncementMarkdown(announcement: LaunchNotesAnnouncement): string {
  const sections: string[] = [];

  // Header
  sections.push(`# ${announcement.headline}`);
  sections.push(`**ID:** ${announcement.id}`);
  sections.push(`**State:** ${announcement.state}`);
  sections.push(`**Slug:** ${announcement.slug}`);

  // Links
  if (announcement.publicPermalink) {
    sections.push(`**Public URL:** ${announcement.publicPermalink}`);
  }
  if (announcement.privatePermalink) {
    sections.push(`**Private URL:** ${announcement.privatePermalink}`);
  }

  // Metadata
  if (announcement.author) {
    sections.push(`**Author:** ${announcement.author}`);
  }
  if (announcement.publishedAt) {
    sections.push(
      `**Published:** ${new Date(announcement.publishedAt).toLocaleString()}`
    );
  }
  if (announcement.scheduledAt) {
    sections.push(
      `**Scheduled:** ${new Date(announcement.scheduledAt).toLocaleString()}`
    );
  }

  // SEO fields
  if (announcement.title) {
    sections.push(`\n## SEO\n**Title:** ${announcement.title}`);
  }
  if (announcement.description) {
    sections.push(`**Description:** ${announcement.description}`);
  }

  // Categories
  if (announcement.categories && announcement.categories.length > 0) {
    sections.push("\n## Categories");
    announcement.categories.forEach((cat) => {
      sections.push(`- ${cat.name}${cat.color ? ` (${cat.color})` : ""}`);
    });
  }

  // Excerpt
  if (announcement.excerpt) {
    sections.push(`\n## Excerpt\n${announcement.excerpt}`);
  }

  // Content preview
  if (announcement.content) {
    const preview =
      announcement.content.substring(0, 500) +
      (announcement.content.length > 500 ? "..." : "");
    sections.push(`\n## Content Preview\n${preview}`);
  }

  // Timestamps
  sections.push(
    `\n*Created: ${new Date(announcement.createdAt).toLocaleString()}*`
  );
  sections.push(`*Updated: ${new Date(announcement.updatedAt).toLocaleString()}*`);

  return sections.join("\n");
}

/**
 * Format announcement list as markdown
 */
export function formatAnnouncementListMarkdown(
  announcements: LaunchNotesAnnouncementList[]
): string {
  if (announcements.length === 0) {
    return "No announcements found.";
  }

  const lines = [`# Announcements (${announcements.length})`, ""];

  announcements.forEach((ann) => {
    lines.push(`## ${ann.headline}`);
    lines.push(`- **ID:** ${ann.id}`);
    lines.push(`- **State:** ${ann.state}`);
    lines.push(`- **Slug:** ${ann.slug}`);
    if (ann.publishedAt) {
      lines.push(
        `- **Published:** ${new Date(ann.publishedAt).toLocaleString()}`
      );
    }
    if (ann.scheduledAt) {
      lines.push(
        `- **Scheduled:** ${new Date(ann.scheduledAt).toLocaleString()}`
      );
    }
    lines.push(`- **Created:** ${new Date(ann.createdAt).toLocaleString()}`);
    lines.push("");
  });

  return lines.join("\n");
}
