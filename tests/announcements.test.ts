/**
 * Announcement Unit Tests (Mocked)
 *
 * These tests mock all GraphQL operations.
 * No live API calls are made (except in schema-validation.test.ts).
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from '../src/shared/client.js';
import * as AnnouncementQueries from '../src/announcements/queries.js';
import { MockFactory } from './helpers/mock-factory.js';

describe('Announcement Operations (Mocked)', () => {
  let originalExecute: any;
  let mockExecute: any;

  before(() => {
    originalExecute = GraphQLClient.prototype.execute;
  });

  after(() => {
    GraphQLClient.prototype.execute = originalExecute;
  });

  describe('createAnnouncement', () => {
    it('sends contentMarkdown parameter correctly', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'createAnnouncement',
          'announcement',
          MockFactory.announcement({
            headline: variables.input.announcement.headline,
          })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnnouncementQueries.createAnnouncement(client, 'pro_test', {
        headline: 'Test Announcement',
        contentMarkdown: '## Hello World\n\nThis is markdown content.',
      });

      assert.strictEqual(capturedVariables.input.announcement.headline, 'Test Announcement');
      assert.strictEqual(
        capturedVariables.input.announcement.contentMarkdown,
        '## Hello World\n\nThis is markdown content.'
      );
      assert.strictEqual(capturedVariables.input.announcement.contentHtml, undefined);
      assert.strictEqual(capturedVariables.input.announcement.contentJira, undefined);
    });

    it('sends contentHtml parameter correctly', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'createAnnouncement',
          'announcement',
          MockFactory.announcement()
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnnouncementQueries.createAnnouncement(client, 'pro_test', {
        headline: 'Test',
        contentHtml: '<h2>Hello World</h2><p>HTML content</p>',
      });

      assert.strictEqual(capturedVariables.input.announcement.contentHtml, '<h2>Hello World</h2><p>HTML content</p>');
      assert.strictEqual(capturedVariables.input.announcement.contentMarkdown, undefined);
    });

    it('sends contentJira parameter correctly', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'createAnnouncement',
          'announcement',
          MockFactory.announcement()
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnnouncementQueries.createAnnouncement(client, 'pro_test', {
        headline: 'Test',
        contentJira: 'h2. Hello World\n\nJira content',
      });

      assert.strictEqual(capturedVariables.input.announcement.contentJira, 'h2. Hello World\n\nJira content');
      assert.strictEqual(capturedVariables.input.announcement.contentMarkdown, undefined);
    });

    it('returns created announcement with correct structure', async () => {
      mockExecute = mock.fn(async () => {
        return MockFactory.mutationResponse(
          'createAnnouncement',
          'announcement',
          MockFactory.announcement({
            headline: 'New Feature',
            state: 'draft',
          })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnnouncementQueries.createAnnouncement(client, 'pro_test', {
        headline: 'New Feature',
        contentMarkdown: 'Content here',
      });

      assert.strictEqual(result.createAnnouncement.announcement.headline, 'New Feature');
      assert.strictEqual(result.createAnnouncement.announcement.state, 'draft');
      assert.strictEqual(result.createAnnouncement.errors.length, 0);
    });
  });

  describe('publishAnnouncement', () => {
    it('uses announcementId parameter (not id)', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'publishAnnouncement',
          'announcement',
          MockFactory.announcement({ state: 'published' })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnnouncementQueries.publishAnnouncement(client, 'ann_123');

      assert.strictEqual(capturedVariables.input.announcementId, 'ann_123');
      assert.strictEqual(capturedVariables.input.id, undefined);
    });

    it('returns published announcement', async () => {
      mockExecute = mock.fn(async () => {
        return MockFactory.mutationResponse(
          'publishAnnouncement',
          'announcement',
          MockFactory.announcement({
            id: 'ann_123',
            state: 'published',
            publishedAt: '2025-12-12T10:00:00Z',
          })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnnouncementQueries.publishAnnouncement(client, 'ann_123');

      assert.strictEqual(result.publishAnnouncement.announcement.state, 'published');
      assert.ok(result.publishAnnouncement.announcement.publishedAt);
    });
  });

  describe('scheduleAnnouncement', () => {
    it('passes timezone parameter when provided', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'scheduleAnnouncement',
          'announcement',
          MockFactory.announcement({ state: 'scheduled' })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnnouncementQueries.scheduleAnnouncement(
        client,
        'ann_123',
        '2025-12-20T09:00:00',
        'America/New_York'
      );

      assert.strictEqual(capturedVariables.input.announcementId, 'ann_123');
      assert.strictEqual(capturedVariables.input.scheduledAt, '2025-12-20T09:00:00');
      assert.strictEqual(capturedVariables.input.scheduledAtTimezone, 'America/New_York');
    });

    it('omits timezone parameter when not provided', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'scheduleAnnouncement',
          'announcement',
          MockFactory.announcement({ state: 'scheduled' })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnnouncementQueries.scheduleAnnouncement(
        client,
        'ann_123',
        '2025-12-20T09:00:00'
      );

      assert.strictEqual(capturedVariables.input.scheduledAtTimezone, undefined);
    });

    it('returns scheduled announcement with scheduledAt timestamp', async () => {
      mockExecute = mock.fn(async () => {
        return MockFactory.mutationResponse(
          'scheduleAnnouncement',
          'announcement',
          MockFactory.announcement({
            state: 'scheduled',
            scheduledAt: '2025-12-20T09:00:00',
          })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnnouncementQueries.scheduleAnnouncement(
        client,
        'ann_123',
        '2025-12-20T09:00:00',
        'UTC'
      );

      assert.strictEqual(result.scheduleAnnouncement.announcement.state, 'scheduled');
      assert.strictEqual(result.scheduleAnnouncement.announcement.scheduledAt, '2025-12-20T09:00:00');
    });
  });

  describe('archiveAnnouncement', () => {
    it('uses announcementId parameter (not id)', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'archiveAnnouncement',
          'announcement',
          MockFactory.announcement({ state: 'archived' })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnnouncementQueries.archiveAnnouncement(client, 'ann_123');

      assert.strictEqual(capturedVariables.input.announcementId, 'ann_123');
      assert.strictEqual(capturedVariables.input.id, undefined);
    });

    it('returns archived announcement', async () => {
      mockExecute = mock.fn(async () => {
        return MockFactory.mutationResponse(
          'archiveAnnouncement',
          'announcement',
          MockFactory.announcement({
            state: 'archived',
          })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnnouncementQueries.archiveAnnouncement(client, 'ann_123');

      assert.strictEqual(result.archiveAnnouncement.announcement.state, 'archived');
    });
  });

  describe('listAnnouncements', () => {
    it('returns list of announcements', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: {
            announcements: {
              nodes: [
                MockFactory.announcement({ headline: 'Announcement 1' }),
                MockFactory.announcement({ headline: 'Announcement 2' }),
              ],
              pageInfo: MockFactory.pageInfo(),
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnnouncementQueries.listAnnouncements(client, 'pro_test', {});

      assert.strictEqual(result.project.announcements.nodes.length, 2);
      assert.strictEqual(result.project.announcements.nodes[0].headline, 'Announcement 1');
    });
  });

  describe('getAnnouncement', () => {
    it('returns single announcement by id', async () => {
      mockExecute = mock.fn(async () => {
        return {
          announcement: MockFactory.announcement({
            id: 'ann_123',
            headline: 'Specific Announcement',
          }),
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await AnnouncementQueries.getAnnouncement(client, 'ann_123');

      assert.strictEqual(result.announcement.id, 'ann_123');
      assert.strictEqual(result.announcement.headline, 'Specific Announcement');
    });
  });

  describe('updateAnnouncement', () => {
    it('sends update attributes correctly', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'updateAnnouncement',
          'announcement',
          MockFactory.announcement({
            headline: 'Updated Headline',
          })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await AnnouncementQueries.updateAnnouncement(client, {
        id: 'ann_123',
        headline: 'Updated Headline',
        excerpt: 'Updated excerpt',
      });

      assert.strictEqual(capturedVariables.input.announcement.id, 'ann_123');
      assert.strictEqual(capturedVariables.input.announcement.headline, 'Updated Headline');
      assert.strictEqual(capturedVariables.input.announcement.excerpt, 'Updated excerpt');
    });
  });
});
