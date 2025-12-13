/**
 * Analytics Unit Tests (Mocked)
 *
 * These tests mock all GraphQL operations.
 * No live API calls are made (except in schema-validation.test.ts).
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from '../src/shared/client.js';
import * as AnalyticsQueries from '../src/analytics/queries.js';
import { MockFactory } from './helpers/mock-factory.js';

describe('Analytics Operations (Mocked)', () => {
  let originalExecute: any;
  let mockExecute: any;

  before(() => {
    originalExecute = GraphQLClient.prototype.execute;
  });

  after(() => {
    GraphQLClient.prototype.execute = originalExecute;
  });

  describe('getTopAnnouncements', () => {
    it('passes project id and limit correctly', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: {
            announcements: {
              nodes: [],
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnalyticsQueries.getTopAnnouncements(client, {
        projectId: 'pro_test',
        metric: 'engagement',
        limit: 10,
      });

      assert.strictEqual(capturedVariables.projectId, 'pro_test');
      assert.strictEqual(capturedVariables.limit, 10);
    });

    it('returns announcements with correct analytics structure', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: {
            announcements: {
              nodes: [
                {
                  id: 'ann_1',
                  headline: 'Top Announcement',
                  slug: 'top-announcement',
                  publishedAt: '2025-01-01T00:00:00Z',
                  state: 'published',
                  viewerAnalytics: {
                    totalUniqueAnonymousCount: 50,
                    totalUniqueEmbeddedCount: 20,
                    totalUniqueSubscribersCount: 30,
                  },
                  emailAnalytics: {
                    sentCount: 200,
                    openRate: 0.6,
                    clickRate: 0.3,
                    clickToOpenRate: 0.5,
                  },
                  feedbackHappyCount: 15,
                  feedbackMehCount: 3,
                  feedbackSadCount: 2,
                },
              ],
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnalyticsQueries.getTopAnnouncements(client, {
        projectId: 'pro_test',
        metric: 'engagement',
        limit: 10,
      });

      // Result is transformed to AnnouncementAnalytics[]
      assert.strictEqual(result.length, 1);
      const item = result[0];

      // Verify announcement data
      assert.strictEqual(item.announcement.id, 'ann_1');
      assert.strictEqual(item.announcement.headline, 'Top Announcement');
      assert.strictEqual(item.announcement.slug, 'top-announcement');

      // Verify calculated metrics
      assert.strictEqual(item.metrics.totalViewers, 100); // 50 + 20 + 30
      assert.strictEqual(item.metrics.emailsSent, 200);
      assert.strictEqual(item.metrics.feedbackCount, 20); // 15 + 3 + 2
      assert.strictEqual(item.metrics.happyFeedbackCount, 15);
      assert.strictEqual(item.metrics.mehFeedbackCount, 3);
      assert.strictEqual(item.metrics.sadFeedbackCount, 2);
    });

    it('returns multiple announcements sorted', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: {
            announcements: {
              nodes: [
                {
                  id: 'ann_1',
                  headline: 'First Announcement',
                  slug: 'first',
                  publishedAt: '2025-01-01T00:00:00Z',
                  state: 'published',
                  viewerAnalytics: {
                    totalUniqueAnonymousCount: 100,
                    totalUniqueEmbeddedCount: 50,
                    totalUniqueSubscribersCount: 75,
                  },
                  emailAnalytics: { sentCount: 0, openRate: 0, clickRate: 0, clickToOpenRate: 0 },
                  feedbackHappyCount: 0,
                  feedbackMehCount: 0,
                  feedbackSadCount: 0,
                },
                {
                  id: 'ann_2',
                  headline: 'Second Announcement',
                  slug: 'second',
                  publishedAt: '2025-01-02T00:00:00Z',
                  state: 'published',
                  viewerAnalytics: {
                    totalUniqueAnonymousCount: 80,
                    totalUniqueEmbeddedCount: 40,
                    totalUniqueSubscribersCount: 60,
                  },
                  emailAnalytics: { sentCount: 0, openRate: 0, clickRate: 0, clickToOpenRate: 0 },
                  feedbackHappyCount: 0,
                  feedbackMehCount: 0,
                  feedbackSadCount: 0,
                },
                {
                  id: 'ann_3',
                  headline: 'Third Announcement',
                  slug: 'third',
                  publishedAt: '2025-01-03T00:00:00Z',
                  state: 'published',
                  viewerAnalytics: {
                    totalUniqueAnonymousCount: 60,
                    totalUniqueEmbeddedCount: 30,
                    totalUniqueSubscribersCount: 45,
                  },
                  emailAnalytics: { sentCount: 0, openRate: 0, clickRate: 0, clickToOpenRate: 0 },
                  feedbackHappyCount: 0,
                  feedbackMehCount: 0,
                  feedbackSadCount: 0,
                },
              ],
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnalyticsQueries.getTopAnnouncements(client, {
        projectId: 'pro_test',
        metric: 'engagement',
        limit: 3,
      });

      // Result should be sorted by totalEngagement (descending)
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].announcement.headline, 'First Announcement');
      assert.strictEqual(result[0].metrics.totalViewers, 225); // Highest
      assert.strictEqual(result[1].announcement.headline, 'Second Announcement');
      assert.strictEqual(result[1].metrics.totalViewers, 180);
      assert.strictEqual(result[2].announcement.headline, 'Third Announcement');
      assert.strictEqual(result[2].metrics.totalViewers, 135); // Lowest
    });

    it('handles announcements with zero analytics', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: {
            announcements: {
              nodes: [
                {
                  id: 'ann_zero',
                  headline: 'Zero Analytics',
                  slug: 'zero',
                  publishedAt: '2025-01-01T00:00:00Z',
                  state: 'published',
                  viewerAnalytics: {
                    totalUniqueAnonymousCount: 0,
                    totalUniqueEmbeddedCount: 0,
                    totalUniqueSubscribersCount: 0,
                  },
                  emailAnalytics: {
                    sentCount: 0,
                    openRate: 0,
                    clickRate: 0,
                    clickToOpenRate: 0,
                  },
                  feedbackHappyCount: 0,
                  feedbackMehCount: 0,
                  feedbackSadCount: 0,
                },
              ],
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnalyticsQueries.getTopAnnouncements(client, {
        projectId: 'pro_test',
        metric: 'engagement',
        limit: 10,
      });

      assert.strictEqual(result.length, 1);
      const item = result[0];

      assert.strictEqual(item.metrics.totalViewers, 0);
      assert.strictEqual(item.metrics.emailsSent, 0);
      assert.strictEqual(item.metrics.feedbackCount, 0);
    });

    it('includes all required fields for each announcement', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: {
            announcements: {
              nodes: [
                {
                  id: 'ann_complete',
                  headline: 'Test Announcement',
                  slug: 'test-announcement',
                  publishedAt: '2025-01-15T10:00:00Z',
                  state: 'published',
                  viewerAnalytics: {
                    totalUniqueAnonymousCount: 10,
                    totalUniqueEmbeddedCount: 5,
                    totalUniqueSubscribersCount: 15,
                  },
                  emailAnalytics: {
                    sentCount: 50,
                    openRate: 0.5,
                    clickRate: 0.25,
                    clickToOpenRate: 0.5,
                  },
                  feedbackHappyCount: 5,
                  feedbackMehCount: 2,
                  feedbackSadCount: 1,
                },
              ],
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnalyticsQueries.getTopAnnouncements(client, {
        projectId: 'pro_test',
        metric: 'engagement',
        limit: 10,
      });

      assert.strictEqual(result.length, 1);
      const item = result[0];

      // Verify all expected fields are present
      assert.ok(item.announcement.id);
      assert.ok(item.announcement.headline);
      assert.ok(item.announcement.slug);
      assert.ok(item.announcement.publishedAt);
      assert.ok(item.metrics);
      assert.ok(typeof item.metrics.totalViewers === 'number');
      assert.ok(typeof item.metrics.emailsSent === 'number');
      assert.ok(typeof item.metrics.feedbackCount === 'number');
      assert.ok(typeof item.metrics.happyFeedbackCount === 'number');
      assert.ok(typeof item.metrics.mehFeedbackCount === 'number');
      assert.ok(typeof item.metrics.sadFeedbackCount === 'number');
    });
  });
});
