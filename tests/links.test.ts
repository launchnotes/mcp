/**
 * External Content Link Unit Tests (Mocked)
 *
 * These tests mock all GraphQL operations.
 * No live API calls are made (except in schema-validation.test.ts).
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from '../src/shared/client.js';
import * as LinkQueries from '../src/links/queries.js';

describe('External Content Link Operations (Mocked)', () => {
  let originalExecute: any;
  let mockExecute: any;

  before(() => {
    originalExecute = GraphQLClient.prototype.execute;
  });

  after(() => {
    GraphQLClient.prototype.execute = originalExecute;
  });

  describe('createExternalContentLink', () => {
    it('nests owner_id, title, and url inside input.externalContentLink', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (_query: string, variables: any) => {
        capturedVariables = variables;
        return { createExternalContentLink: { errors: [] } };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await LinkQueries.createExternalContentLink(
        client,
        'ann_123',
        'Read the blog post',
        'https://blog.launchnotes.com/v2'
      );

      assert.strictEqual(capturedVariables.input.externalContentLink.ownerId, 'ann_123');
      assert.strictEqual(capturedVariables.input.externalContentLink.title, 'Read the blog post');
      assert.strictEqual(capturedVariables.input.externalContentLink.url, 'https://blog.launchnotes.com/v2');
    });

    it('returns errors array when API rejects the input', async () => {
      mockExecute = mock.fn(async () => {
        return {
          createExternalContentLink: {
            errors: [{ message: 'URL is invalid', path: ['url'] }],
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await LinkQueries.createExternalContentLink(
        client,
        'ann_123',
        'Bad link',
        'not-a-url'
      );

      assert.strictEqual(result.createExternalContentLink.errors.length, 1);
      assert.strictEqual(result.createExternalContentLink.errors[0].message, 'URL is invalid');
    });

    it('returns empty errors array on successful creation', async () => {
      mockExecute = mock.fn(async () => {
        return { createExternalContentLink: { errors: [] } };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await LinkQueries.createExternalContentLink(
        client,
        'ann_123',
        'Docs',
        'https://docs.launchnotes.com'
      );

      assert.strictEqual(result.createExternalContentLink.errors.length, 0);
    });

    it('passes X-LN-MCP-Tool header when toolName is provided', async () => {
      let capturedHeaders: any;

      mockExecute = mock.fn(async (_query: string, _variables: any, headers: any) => {
        capturedHeaders = headers;
        return { createExternalContentLink: { errors: [] } };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await LinkQueries.createExternalContentLink(
        client,
        'ann_123',
        'Blog',
        'https://example.com',
        'launchnotes_create_external_content_link'
      );

      assert.strictEqual(
        capturedHeaders['X-LN-MCP-Tool'],
        'launchnotes_create_external_content_link'
      );
    });

    it('omits tracking header when toolName is not provided', async () => {
      let capturedHeaders: any;

      mockExecute = mock.fn(async (_query: string, _variables: any, headers: any) => {
        capturedHeaders = headers;
        return { createExternalContentLink: { errors: [] } };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await LinkQueries.createExternalContentLink(
        client,
        'ann_123',
        'Blog',
        'https://example.com'
      );

      assert.strictEqual(capturedHeaders, undefined);
    });
  });
});
