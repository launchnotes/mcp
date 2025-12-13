/**
 * Analytics Formatting Functions
 */

import type { AnnouncementAnalytics } from "./types.js";

/**
 * Format top announcements analytics as markdown
 */
export function formatTopAnnouncementsMarkdown(
  announcements: AnnouncementAnalytics[],
  metric: string
): string {
  if (announcements.length === 0) {
    return "No published announcements found.";
  }

  const metricLabels: Record<string, string> = {
    engagement: "Total Engagement",
    open_rate: "Open Rate",
    click_rate: "Click Rate",
    feedback_count: "Feedback Count",
    feedback_sentiment: "Average Sentiment",
  };

  const lines = [
    `# Top Announcements by ${metricLabels[metric] || metric}`,
    `**Total announcements:** ${announcements.length}`,
    "",
  ];

  announcements.forEach((item, index) => {
    const ann = item.announcement;
    const m = item.metrics;

    lines.push(`## ${index + 1}. ${ann.headline}`);
    lines.push(`**ID:** ${ann.id}`);
    lines.push(`**Slug:** ${ann.slug}`);

    if (ann.publishedAt) {
      lines.push(
        `**Published:** ${new Date(ann.publishedAt).toLocaleString()}`
      );
    }

    lines.push("");
    lines.push("### Metrics");

    // Show the primary metric prominently
    switch (metric) {
      case "engagement":
        lines.push(`**Total Engagement: ${m.totalEngagement}**`);
        lines.push(`  - Total Viewers: ${m.totalViewers}`);
        lines.push(`  - Email Opens: ${m.emailOpens}`);
        lines.push(`  - Email Clicks: ${m.emailClicks}`);
        break;
      case "open_rate":
        lines.push(
          `**Open Rate: ${m.openRate ? (m.openRate * 100).toFixed(1) : 0}%**`
        );
        lines.push(`  - Emails Opened: ${m.emailOpens || 0}`);
        break;
      case "click_rate":
        lines.push(
          `**Click Rate: ${m.clickRate ? (m.clickRate * 100).toFixed(1) : 0}%**`
        );
        lines.push(`  - Emails Clicked: ${m.emailClicks || 0}`);
        break;
      case "feedback_count":
        lines.push(`**Total Feedback: ${m.feedbackCount || 0}**`);
        lines.push(`  - Happy: ${m.happyFeedbackCount || 0}`);
        lines.push(`  - Sad: ${m.sadFeedbackCount || 0}`);
        break;
      case "feedback_sentiment":
        lines.push(
          `**Average Sentiment: ${m.averageSentiment ? m.averageSentiment.toFixed(2) : "N/A"}**`
        );
        lines.push(`  - Total Feedback: ${m.feedbackCount || 0}`);
        break;
    }

    // Show additional metrics
    lines.push("");
    lines.push("**Other Metrics:**");
    if (metric !== "engagement") {
      lines.push(`- Total Engagement: ${m.totalEngagement || 0}`);
    }
    if (metric !== "open_rate") {
      lines.push(
        `- Open Rate: ${m.openRate ? (m.openRate * 100).toFixed(1) + "%" : "N/A"}`
      );
    }
    if (metric !== "click_rate") {
      lines.push(
        `- Click Rate: ${m.clickRate ? (m.clickRate * 100).toFixed(1) + "%" : "N/A"}`
      );
    }
    if (metric !== "feedback_count") {
      lines.push(`- Feedback Count: ${m.feedbackCount || 0}`);
    }

    lines.push("");
  });

  return lines.join("\n");
}
