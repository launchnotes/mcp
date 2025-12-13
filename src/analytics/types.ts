/**
 * Analytics Type Definitions
 */

export interface AnnouncementAnalytics {
  announcement: {
    id: string;
    headline: string;
    slug: string;
    publishedAt?: string;
  };
  metrics: {
    totalEngagement: number;
    totalViewers: number;
    emailsSent: number;
    emailOpens: number;
    emailClicks: number;
    openRate: number;
    clickRate: number;
    feedbackCount: number;
    happyFeedbackCount: number;
    sadFeedbackCount: number;
    mehFeedbackCount: number;
    averageSentiment: number;
  };
}

export interface TopAnnouncementsFilters {
  projectId: string;
  metric: "engagement" | "open_rate" | "click_rate" | "feedback_count" | "feedback_sentiment";
  limit?: number;
}
