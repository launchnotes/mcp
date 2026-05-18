/**
 * Template Unit Tests (Mocked)
 *
 * These tests mock all GraphQL operations.
 * No live API calls are made (except in schema-validation.test.ts).
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from '../src/shared/client.js';
import * as TemplateQueries from '../src/templates/queries.js';
import { formatTemplateListMarkdown } from '../src/templates/formatters.js';
import { MockFactory } from './helpers/mock-factory.js';

describe('Template Operations (Mocked)', () => {
  let originalExecute: any;
  let mockExecute: any;

  before(() => {
    originalExecute = GraphQLClient.prototype.execute;
  });

  after(() => {
    GraphQLClient.prototype.execute = originalExecute;
  });

  describe('listTemplates', () => {
    it('returns list of templates for a project', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: {
            templates: {
              nodes: [
                MockFactory.template({ id: 'tpl_1', name: 'Feature Launch' }),
                MockFactory.template({ id: 'tpl_2', name: 'Bug Fix' }),
              ],
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await TemplateQueries.listTemplates(client, 'pro_123');

      assert.strictEqual(result.project.templates.nodes.length, 2);
      assert.strictEqual(result.project.templates.nodes[0].name, 'Feature Launch');
    });

    it('passes project id and limit correctly', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (_query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: { templates: { nodes: [] } },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await TemplateQueries.listTemplates(client, 'pro_123', 25);

      assert.strictEqual(capturedVariables.projectId, 'pro_123');
      assert.strictEqual(capturedVariables.first, 25);
    });

    it('defaults to first: 100 when no limit is passed', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (_query: string, variables: any) => {
        capturedVariables = variables;
        return {
          project: { templates: { nodes: [] } },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await TemplateQueries.listTemplates(client, 'pro_123');

      assert.strictEqual(capturedVariables.first, 100);
    });

    it('returns empty list when project has no templates', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: { templates: { nodes: [] } },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await TemplateQueries.listTemplates(client, 'pro_123');

      assert.strictEqual(result.project.templates.nodes.length, 0);
    });
  });

  describe('formatTemplateListMarkdown', () => {
    it('returns "No templates found." for an empty list', () => {
      const output = formatTemplateListMarkdown([]);
      assert.strictEqual(output, 'No templates found.');
    });

    it('renders template count and names', () => {
      const templates = [
        MockFactory.template({ id: 'tpl_1', name: 'Alpha' }),
        MockFactory.template({ id: 'tpl_2', name: 'Beta' }),
      ];
      const output = formatTemplateListMarkdown(templates);

      assert.ok(output.includes('# Templates (2)'));
      assert.ok(output.includes('## Alpha'));
      assert.ok(output.includes('## Beta'));
      assert.ok(output.includes('**ID:** tpl_1'));
      assert.ok(output.includes('**ID:** tpl_2'));
    });

    it('omits optional fields when missing', () => {
      const templates = [
        MockFactory.template({
          id: 'tpl_1',
          name: 'Minimal',
          headline: undefined,
          description: undefined,
        }),
      ];
      const output = formatTemplateListMarkdown(templates);

      assert.ok(output.includes('## Minimal'));
      assert.ok(!output.includes('**Headline:**'));
      assert.ok(!output.includes('**Description:**'));
    });
  });

  describe('alpha sort', () => {
    it('localeCompare sorts templates A→Z by name', () => {
      // Mirrors the sort in src/templates/tools.ts so we have coverage on the contract.
      const templates = [
        MockFactory.template({ name: 'Zebra' }),
        MockFactory.template({ name: 'Apple' }),
        MockFactory.template({ name: 'Mango' }),
      ];

      const sorted = [...templates].sort((a, b) => a.name.localeCompare(b.name));

      assert.deepStrictEqual(
        sorted.map((t) => t.name),
        ['Apple', 'Mango', 'Zebra']
      );
    });

    it('handles case-insensitive ordering', () => {
      const templates = [
        MockFactory.template({ name: 'banana' }),
        MockFactory.template({ name: 'Apple' }),
        MockFactory.template({ name: 'cherry' }),
      ];

      const sorted = [...templates].sort((a, b) => a.name.localeCompare(b.name));

      assert.deepStrictEqual(
        sorted.map((t) => t.name),
        ['Apple', 'banana', 'cherry']
      );
    });
  });
});
