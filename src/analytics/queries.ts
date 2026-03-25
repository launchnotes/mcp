/**
 * Analytics GraphQL Queries and Operations
 */

import type { GraphQLClient } from "../shared/client.js";
import type { AnnouncementAnalytics, TopAnnouncementsFilters } from "./types.js";

// GraphQL query string for top announcements
export const GET_TOP_ANNOUNCEMENTS_QUERY = `
  query GetTopAnnouncements(
    $projectId: ID!,
    $limit: Int
  ) {
    project(id: $projectId) {
      announcements(
        first: $limit,
        state: published
      ) {
        nodes {
          id
          headline
          slug
          publishedAt
          state
          viewerAnalytics {
            totalUniqueAnonymousCount
            totalUniqueEmbeddedCount
            totalUniqueSubscribersCount
          }
          emailAnalytics {
            sentCount
            openRate
            clickRate
            clickToOpenRate
          }
          feedbackHappyCount
          feedbackMehCount
          feedbackSadCount
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

// Operation function
export async function getTopAnnouncements(
  client: GraphQLClient,
  filters: TopAnnouncementsFilters,
  toolName?: string
): Promise<AnnouncementAnalytics[]> {
  const result = await client.execute<{
    project: {
      announcements: {
        nodes: Array<{
          id: string;
          headline: string;
          slug: string;
          publishedAt?: string;
          state: string;
          viewerAnalytics: {
            totalUniqueAnonymousCount: number;
            totalUniqueEmbeddedCount: number;
            totalUniqueSubscribersCount: number;
          } | null;
          emailAnalytics: {
            sentCount: number;
            openRate: number;
            clickRate: number;
            clickToOpenRate: number;
          } | null;
          feedbackHappyCount: number;
          feedbackMehCount: number;
          feedbackSadCount: number;
        }>;
      };
    };
  }>(
    GET_TOP_ANNOUNCEMENTS_QUERY,
    {
      projectId: filters.projectId,
      limit: filters.limit || 10,
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );

  // Transform data and calculate engagement scores
  const announcements = result.project.announcements.nodes.map((node) => {
      // Safely handle null viewerAnalytics
      const totalViewers = node.viewerAnalytics
        ? node.viewerAnalytics.totalUniqueAnonymousCount +
          node.viewerAnalytics.totalUniqueEmbeddedCount +
          node.viewerAnalytics.totalUniqueSubscribersCount
        : 0;

      // Safely handle null emailAnalytics
      const emailsSent = node.emailAnalytics?.sentCount || 0;
      const opens = emailsSent > 0 ? Math.round(emailsSent * (node.emailAnalytics?.openRate || 0)) : 0;
      const clicks = emailsSent > 0 ? Math.round(emailsSent * (node.emailAnalytics?.clickRate || 0)) : 0;

      const totalEngagement = totalViewers + opens + clicks;

      const totalFeedback =
        node.feedbackHappyCount + node.feedbackMehCount + node.feedbackSadCount;

      // Calculate average sentiment (happy=1, meh=0, sad=-1)
      const averageSentiment =
        totalFeedback > 0
          ? (node.feedbackHappyCount - node.feedbackSadCount) / totalFeedback
          : 0;

      return {
        announcement: {
          id: node.id,
          headline: node.headline,
          slug: node.slug,
          publishedAt: node.publishedAt,
        },
        metrics: {
          totalEngagement,
          totalViewers,
          emailsSent,
          emailOpens: opens,
          emailClicks: clicks,
          openRate: node.emailAnalytics?.openRate || 0,
          clickRate: node.emailAnalytics?.clickRate || 0,
          feedbackCount: totalFeedback,
          happyFeedbackCount: node.feedbackHappyCount,
          sadFeedbackCount: node.feedbackSadCount,
          mehFeedbackCount: node.feedbackMehCount,
          averageSentiment,
        },
      };
    });

  // Sort by the requested metric
  return announcements.sort((a, b) => {
    let aValue = 0;
    let bValue = 0;

    switch (filters.metric) {
      case "engagement":
        aValue = a.metrics.totalEngagement || 0;
        bValue = b.metrics.totalEngagement || 0;
        break;
      case "open_rate":
        aValue = a.metrics.openRate || 0;
        bValue = b.metrics.openRate || 0;
        break;
      case "click_rate":
        aValue = a.metrics.clickRate || 0;
        bValue = b.metrics.clickRate || 0;
        break;
      case "feedback_count":
        aValue = a.metrics.feedbackCount || 0;
        bValue = b.metrics.feedbackCount || 0;
        break;
      case "feedback_sentiment":
        aValue = a.metrics.averageSentiment || 0;
        bValue = b.metrics.averageSentiment || 0;
        break;
    }

    return bValue - aValue; // Descending order
  });
}
