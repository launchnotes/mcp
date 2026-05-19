/**
 * Roadmap Unit Tests (Mocked)
 *
 * These tests mock all GraphQL operations.
 * No live API calls are made (except in schema-validation.test.ts).
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from '../src/shared/client.js';
import * as RoadmapQueries from '../src/roadmap/queries.js';
import {
  formatStageListMarkdown,
  formatWorkItemListMarkdown,
  formatMoveWorkItemMarkdown,
} from '../src/roadmap/formatters.js';
import { MockFactory } from './helpers/mock-factory.js';

describe('Roadmap Operations (Mocked)', () => {
  let originalExecute: any;
  let mockExecute: any;

  before(() => {
    originalExecute = GraphQLClient.prototype.execute;
  });

  after(() => {
    GraphQLClient.prototype.execute = originalExecute;
  });

  describe('listStages', () => {
    it('returns stages for a project', async () => {
      mockExecute = mock.fn(async () => ({
        project: {
          stages: {
            nodes: [
              MockFactory.stage({ id: 'stage_a', name: 'Planning', position: 0 }),
              MockFactory.stage({ id: 'stage_b', name: 'Shipped', position: 1 }),
            ],
          },
        },
      }));
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await RoadmapQueries.listStages(client, 'pro_123');

      assert.strictEqual(result.project.stages.nodes.length, 2);
      assert.strictEqual(result.project.stages.nodes[0].name, 'Planning');
    });

    it('passes project id', async () => {
      let capturedVariables: any;
      mockExecute = mock.fn(async (_q: string, vars: any) => {
        capturedVariables = vars;
        return { project: { stages: { nodes: [] } } };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await RoadmapQueries.listStages(client, 'pro_123');

      assert.strictEqual(capturedVariables.projectId, 'pro_123');
    });
  });

  describe('listWorkItems', () => {
    it('returns work items for a project', async () => {
      mockExecute = mock.fn(async () => ({
        project: {
          workItems: {
            nodes: [
              MockFactory.workItem({ id: 'work_a', name: 'Auth' }),
              MockFactory.workItem({ id: 'work_b', name: 'Billing' }),
            ],
          },
        },
      }));
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await RoadmapQueries.listWorkItems(client, 'pro_123');

      assert.strictEqual(result.project.workItems.nodes.length, 2);
    });

    it('passes project id', async () => {
      let capturedVariables: any;
      mockExecute = mock.fn(async (_q: string, vars: any) => {
        capturedVariables = vars;
        return { project: { workItems: { nodes: [] } } };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await RoadmapQueries.listWorkItems(client, 'pro_123');

      assert.strictEqual(capturedVariables.projectId, 'pro_123');
    });
  });

  describe('repositionWorkItem', () => {
    it('passes only id and targetStageId to the mutation', async () => {
      // Critical contract: position and sourceStageId must NOT leak through,
      // per LN-8809 slim spec. The server infers source and appends to bottom.
      let capturedVariables: any;
      mockExecute = mock.fn(async (_q: string, vars: any) => {
        capturedVariables = vars;
        return {
          repositionWorkItem: {
            workItem: MockFactory.workItem(),
            sourceStage: MockFactory.stage({ name: 'Planning' }),
            targetStage: MockFactory.stage({ name: 'Shipped' }),
            errors: [],
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await RoadmapQueries.repositionWorkItem(client, 'work_xyz', 'stage_shipped');

      const sent = capturedVariables.input.workItem;
      assert.deepStrictEqual(Object.keys(sent).sort(), ['id', 'targetStageId']);
      assert.strictEqual(sent.id, 'work_xyz');
      assert.strictEqual(sent.targetStageId, 'stage_shipped');
      assert.strictEqual(sent.position, undefined);
      assert.strictEqual(sent.sourceStageId, undefined);
    });

    it('returns source/target stages and updated work item', async () => {
      mockExecute = mock.fn(async () => ({
        repositionWorkItem: {
          workItem: MockFactory.workItem({ name: 'Auth' }),
          sourceStage: MockFactory.stage({ name: 'Planning' }),
          targetStage: MockFactory.stage({ name: 'Shipped' }),
          errors: [],
        },
      }));
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await RoadmapQueries.repositionWorkItem(
        client,
        'work_xyz',
        'stage_shipped'
      );

      assert.strictEqual(result.repositionWorkItem.workItem?.name, 'Auth');
      assert.strictEqual(result.repositionWorkItem.sourceStage?.name, 'Planning');
      assert.strictEqual(result.repositionWorkItem.targetStage?.name, 'Shipped');
    });
  });

  describe('formatStageListMarkdown', () => {
    it('returns "No stages found." for an empty list', () => {
      assert.strictEqual(formatStageListMarkdown([]), 'No stages found.');
    });

    it('renders stage count and names', () => {
      const out = formatStageListMarkdown([
        MockFactory.stage({ id: 'stage_a', name: 'Planning', position: 0 }),
        MockFactory.stage({ id: 'stage_b', name: 'Shipped', position: 1 }),
      ]);
      assert.ok(out.includes('# Stages (2)'));
      assert.ok(out.includes('## Planning'));
      assert.ok(out.includes('## Shipped'));
      assert.ok(out.includes('**ID:** stage_a'));
      assert.ok(out.includes('**Position:** 1'));
    });
  });

  describe('formatWorkItemListMarkdown', () => {
    it('returns "No work items found." for an empty list', () => {
      assert.strictEqual(formatWorkItemListMarkdown([]), 'No work items found.');
    });

    it('renders work item count, names, and stage ids', () => {
      const out = formatWorkItemListMarkdown([
        MockFactory.workItem({ id: 'work_a', name: 'Auth', stageId: 'stage_x' }),
      ]);
      assert.ok(out.includes('# Work items (1)'));
      assert.ok(out.includes('## Auth'));
      assert.ok(out.includes('**ID:** work_a'));
      assert.ok(out.includes('**Stage ID:** stage_x'));
    });
  });

  describe('formatMoveWorkItemMarkdown', () => {
    it('renders with source stage when known', () => {
      const out = formatMoveWorkItemMarkdown({
        workItemName: 'Auth',
        sourceStageName: 'Planning',
        targetStageName: 'Shipped',
      });
      assert.strictEqual(out, "✓ Moved 'Auth' from Planning → Shipped.");
    });

    it('omits the "from" clause when source stage is unknown', () => {
      const out = formatMoveWorkItemMarkdown({
        workItemName: 'Auth',
        targetStageName: 'Shipped',
      });
      assert.strictEqual(out, "✓ Moved 'Auth' → Shipped.");
    });
  });
});
