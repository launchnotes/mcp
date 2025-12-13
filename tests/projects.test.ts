/**
 * Project Unit Tests (Mocked)
 *
 * These tests mock all GraphQL operations.
 * No live API calls are made (except in schema-validation.test.ts).
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from '../src/shared/client.js';
import * as ProjectQueries from '../src/projects/queries.js';
import { MockFactory } from './helpers/mock-factory.js';

describe('Project Operations (Mocked)', () => {
  let originalExecute: any;
  let mockExecute: any;

  before(() => {
    originalExecute = GraphQLClient.prototype.execute;
  });

  after(() => {
    GraphQLClient.prototype.execute = originalExecute;
  });

  describe('getProject', () => {
    it('returns single project by id', async () => {
      mockExecute = mock.fn(async () => {
        return {
          project: MockFactory.project({
            id: 'pro_123',
            name: 'My Project',
          }),
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await ProjectQueries.getProject(client, 'pro_123');

      assert.strictEqual(result.project.id, 'pro_123');
      assert.strictEqual(result.project.name, 'My Project');
    });
  });

  describe('listProjects', () => {
    it('returns list of projects', async () => {
      mockExecute = mock.fn(async () => {
        return {
          viewer: {
            projects: {
              nodes: [
                MockFactory.project({ name: 'Project 1' }),
                MockFactory.project({ name: 'Project 2' }),
              ],
            },
          },
        };
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await ProjectQueries.listProjects(client);

      assert.strictEqual(result.viewer.projects.nodes.length, 2);
      assert.strictEqual(result.viewer.projects.nodes[0].name, 'Project 1');
      assert.strictEqual(result.viewer.projects.nodes[1].name, 'Project 2');
    });
  });

  describe('updateProject', () => {
    it('includes id inside project attributes', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'updateProject',
          'project',
          MockFactory.project({
            name: 'Updated Project',
          })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await ProjectQueries.updateProject(client, 'pro_123', {
        name: 'Updated Project',
      });

      // Verify id is inside project object, not at top level
      assert.strictEqual(capturedVariables.input.project.id, 'pro_123');
      assert.strictEqual(capturedVariables.input.project.name, 'Updated Project');
      assert.strictEqual(capturedVariables.input.id, undefined);
    });

    it('sends multiple attributes correctly', async () => {
      let capturedVariables: any;

      mockExecute = mock.fn(async (query: string, variables: any) => {
        capturedVariables = variables;
        return MockFactory.mutationResponse(
          'updateProject',
          'project',
          MockFactory.project()
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      await ProjectQueries.updateProject(client, 'pro_123', {
        name: 'New Name',
        description: 'New description',
        primaryColor: '#FF5733',
      });

      assert.strictEqual(capturedVariables.input.project.id, 'pro_123');
      assert.strictEqual(capturedVariables.input.project.name, 'New Name');
      assert.strictEqual(capturedVariables.input.project.description, 'New description');
      assert.strictEqual(capturedVariables.input.project.primaryColor, '#FF5733');
    });

    it('returns updated project', async () => {
      mockExecute = mock.fn(async () => {
        return MockFactory.mutationResponse(
          'updateProject',
          'project',
          MockFactory.project({
            id: 'pro_123',
            name: 'Updated Name',
            description: 'Updated description',
          })
        );
      });
      GraphQLClient.prototype.execute = mockExecute;

      const client = new GraphQLClient('mock-token');
      const result = await ProjectQueries.updateProject(client, 'pro_123', {
        name: 'Updated Name',
        description: 'Updated description',
      });

      assert.strictEqual(result.updateProject.project.name, 'Updated Name');
      assert.strictEqual(result.updateProject.project.description, 'Updated description');
      assert.strictEqual(result.updateProject.errors.length, 0);
    });
  });
});
