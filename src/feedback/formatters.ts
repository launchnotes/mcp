/**
 * Feedback Formatting Functions
 */

import type { LaunchNotesFeedback, LaunchNotesFeedbackListItem } from "./types.js";

/**
 * Format feedback data as markdown
 */
export function formatFeedbackMarkdown(feedback: LaunchNotesFeedback): string {
  const sections: string[] = [];

  // Header
  sections.push(`# Feedback Details`);
  sections.push(`**ID:** ${feedback.id}`);

  // Sentiment indicators
  const reactionEmoji = {
    happy: "😊 Happy",
    meh: "😐 Neutral",
    sad: "😞 Unhappy",
  };
  if (feedback.reaction) {
    sections.push(`**Reaction:** ${reactionEmoji[feedback.reaction]}`);
  }

  if (feedback.importance) {
    const importanceLabel =
      feedback.importance.charAt(0).toUpperCase() + feedback.importance.slice(1);
    sections.push(`**Importance:** ${importanceLabel}`);
  }

  sections.push(`**Starred:** ${feedback.starred ? "⭐ Yes" : "No"}`);
  sections.push(`**Archived:** ${feedback.archived ? "📦 Yes" : "No"}`);

  // Customer info
  sections.push(`\n## Affected Customer`);
  sections.push(`**ID:** ${feedback.affectedCustomer.id}`);
  sections.push(`**Email:** ${feedback.affectedCustomer.email}`);
  if (feedback.affectedCustomer.initials) {
    sections.push(`**Initials:** ${feedback.affectedCustomer.initials}`);
  }
  if (feedback.affectedCustomer.confirmedAt) {
    sections.push(`**Confirmed:** ${new Date(feedback.affectedCustomer.confirmedAt).toLocaleString()}`);
  }

  // Reporter info
  if (feedback.reporter) {
    sections.push(`\n## Reporter`);
    sections.push(`**ID:** ${feedback.reporter.id}`);
    sections.push(`**Email:** ${feedback.reporter.email}`);
  }

  // Associated item
  if (feedback.feedbackable) {
    sections.push(`\n## Associated With`);
    sections.push(`**Type:** ${feedback.feedbackable.__typename}`);
    sections.push(`**ID:** ${feedback.feedbackable.id}`);
    if (feedback.feedbackable.name) {
      sections.push(`**Name:** ${feedback.feedbackable.name}`);
    }
  }

  // Content
  sections.push(`\n## Content`);
  sections.push(feedback.content);

  // Notes
  if (feedback.notes) {
    sections.push(`\n## Internal Notes`);
    sections.push(feedback.notes);
  }

  // Timestamps
  sections.push(
    `\n*Created: ${new Date(feedback.createdAt).toLocaleString()}*`
  );
  sections.push(`*Updated: ${new Date(feedback.updatedAt).toLocaleString()}*`);

  return sections.join("\n");
}

/**
 * Format feedback list as markdown
 */
export function formatFeedbackListMarkdown(
  feedbacks: LaunchNotesFeedbackListItem[]
): string {
  if (feedbacks.length === 0) {
    return "No feedback found.";
  }

  const lines = [`# Feedback Items (${feedbacks.length})`, ""];

  feedbacks.forEach((fb) => {
    // Sentiment emoji
    const reactionEmoji = {
      happy: "😊",
      meh: "😐",
      sad: "😞",
    };
    const emoji = fb.reaction ? reactionEmoji[fb.reaction] : "⚪";

    // Status indicators
    const starredIndicator = fb.starred ? " ⭐" : "";
    const archivedIndicator = fb.archived ? " 📦" : "";

    lines.push(`## ${emoji}${starredIndicator}${archivedIndicator} Feedback #${fb.id}`);

    // Content preview (first 150 chars)
    const contentPreview =
      fb.content.substring(0, 150) + (fb.content.length > 150 ? "..." : "");
    lines.push(`**Content:** ${contentPreview}`);

    lines.push(`**ID:** ${fb.id}`);

    if (fb.importance) {
      const importanceLabel =
        fb.importance.charAt(0).toUpperCase() + fb.importance.slice(1);
      lines.push(`**Importance:** ${importanceLabel}`);
    }

    const customerInfo = fb.affectedCustomer.initials || fb.affectedCustomer.email;
    lines.push(`**Customer:** ${customerInfo}`);

    if (fb.reporter) {
      lines.push(`**Reporter:** ${fb.reporter.email}`);
    }

    lines.push(`**Created:** ${new Date(fb.createdAt).toLocaleString()}`);
    lines.push("");
  });

  return lines.join("\n");
}
