/**
 * Feedback Unit Tests (Mocked)
 *
 * These tests mock all GraphQL operations.
 * No live API calls are made (except in schema-validation.test.ts).
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from '../src/shared/client.js';
import * as FeedbackQueries from '../src/feedback/queries.js';
import { MockFactory } from './helpers/mock-factory.js';

describe('Feedback Operations (Mocked)', () => {
  let originalExecute: any;
  let mockExecute: any;

  before(() => {
    originalExecute = GraphQLClient.prototype.execute;
  });

  after(() => {
    GraphQLClient.prototype.execute = originalExecute;
  });

  describe('searchFeedback', () => {
    it('uses enum values for reaction parameter', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: {
            feedbacks: {
              nodes: [],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await FeedbackQueries.searchFeedback(client, {
        projectId: 'pro_test',
        reaction: 'happy',
      });

      assert.strictEqual(capturedVariables.reaction, 'happy');
    });

    it('uses enum values for importance parameter', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: {
            feedbacks: {
              nodes: [],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await FeedbackQueries.searchFeedback(client, {
        projectId: 'pro_test',
        importance: 'high',
      });

      assert.strictEqual(capturedVariables.importance, 'high');
    });

    it('supports starred filter parameter', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: {
            feedbacks: {
              nodes: [],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await FeedbackQueries.searchFeedback(client, {
        projectId: 'pro_test',
        starred: true,
      });

      assert.strictEqual(capturedVariables.starred, true);
    });

    it('supports archived filter parameter', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: {
            feedbacks: {
              nodes: [],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await FeedbackQueries.searchFeedback(client, {
        projectId: 'pro_test',
        archived: false,
      });

      assert.strictEqual(capturedVariables.archived, false);
    });

    it('supports query text parameter', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: {
            feedbacks: {
              nodes: [],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await FeedbackQueries.searchFeedback(client, {
        projectId: 'pro_test',
        query: 'feature request',
      });

      assert.strictEqual(capturedVariables.searchTerm, 'feature request');
    });

    it('supports organized state filter', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: {
            feedbacks: {
              nodes: [],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await FeedbackQueries.searchFeedback(client, {
        projectId: 'pro_test',
        organizedState: 'unorganized',
      });

      assert.strictEqual(capturedVariables.organizedState, 'unorganized');
    });

    it('returns list of feedback with correct structure', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: {
            feedbacks: {
              nodes: [
                MockFactory.feedback({
                  content: 'Great feature!',
                  reaction: 'happy',
                  importance: 'high',
                  starred: true,
                  archived: false,
                }),
                MockFactory.feedback({
                  content: 'Bug report',
                  reaction: 'sad',
                  importance: 'medium',
                }),
              ],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await FeedbackQueries.searchFeedback(client, {
        projectId: 'pro_test',
      });

      assert.strictEqual(result.project.feedbacks.nodes.length, 2);
      assert.strictEqual(result.project.feedbacks.nodes[0].content, 'Great feature!');
      assert.strictEqual(result.project.feedbacks.nodes[0].reaction, 'happy');
      assert.strictEqual(result.project.feedbacks.nodes[0].starred, true);
      assert.strictEqual(result.project.feedbacks.nodes[0].affectedCustomer.email, 'test@example.com');
    });

    it('supports pagination parameters', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: {
            feedbacks: {
              nodes: [],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await FeedbackQueries.searchFeedback(client, {
        projectId: 'pro_test',
        first: 20,
        after: 'cursor_abc',
      });

      assert.strictEqual(capturedVariables.first, 20);
      assert.strictEqual(capturedVariables.after, 'cursor_abc');
    });
  });

  describe('getFeedback', () => {
    it('returns single feedback item by id', async () => {
      mockExecute = mock.fn(async () => {
        return {
          feedback: MockFactory.feedback({
            id: 'fb_123',
            content: 'Specific feedback item',
            reaction: 'happy',
          }),
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await FeedbackQueries.getFeedback(client, 'fb_123');

      assert.strictEqual(result.feedback.id, 'fb_123');
      assert.strictEqual(result.feedback.content, 'Specific feedback item');
      assert.strictEqual(result.feedback.reaction, 'happy');
    });

    it('includes affectedCustomer with email and initials', async () => {
      mockExecute = mock.fn(async () => {
        return {
          feedback: MockFactory.feedback({
            affectedCustomer: {
              email: 'user@example.com',
              initials: 'UE',
            },
          }),
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await FeedbackQueries.getFeedback(client, 'fb_123');

      assert.strictEqual(result.feedback.affectedCustomer.email, 'user@example.com');
      assert.strictEqual(result.feedback.affectedCustomer.initials, 'UE');
    });
  });
});
