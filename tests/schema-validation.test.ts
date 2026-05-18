/**
 * Schema Validation Tests
 *
 * These tests validate that all GraphQL queries/mutations are valid
 * against the LIVE LaunchNotes API schema (not a stored copy).
 *
 * The schema is fetched once via introspection query at the start of the test suite.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { parse, validate, GraphQLSchema } from 'graphql';
import { getLiveSchema } from './helpers/schema-fetcher.js';
import {
  CREATE_ANNOUNCEMENT_MUTATION,
  PUBLISH_ANNOUNCEMENT_MUTATION,
  SCHEDULE_ANNOUNCEMENT_MUTATION,
  ARCHIVE_ANNOUNCEMENT_MUTATION,
  LIST_ANNOUNCEMENTS_QUERY,
  GET_ANNOUNCEMENT_QUERY,
  UPDATE_ANNOUNCEMENT_MUTATION,
} from '../src/announcements/queries.js';
import {
  GET_PROJECT_QUERY,
  LIST_PROJECTS_QUERY,
  UPDATE_PROJECT_MUTATION,
} from '../src/projects/queries.js';
import {
  SEARCH_FEEDBACK_QUERY,
  GET_FEEDBACK_QUERY,
} from '../src/feedback/queries.js';
import {
  GET_TOP_ANNOUNCEMENTS_QUERY,
} from '../src/analytics/queries.js';
import {
  LIST_TEMPLATES_QUERY,
} from '../src/templates/queries.js';

describe('Schema Validation (Live Schema)', () => {
  let schema: GraphQLSchema;

  before(async () => {
    schema = await getLiveSchema();
  });

  describe('Announcement Queries', () => {
    it('CREATE_ANNOUNCEMENT_MUTATION is valid against live schema', () => {
      const document = parse(CREATE_ANNOUNCEMENT_MUTATION);
      const errors = validate(schema, document);

      assert.strictEqual(
        errors.length,
        0,
        `Validation errors: ${errors.map(e => e.message).join(', ')}`
      );
    });

    it('PUBLISH_ANNOUNCEMENT_MUTATION is valid against live schema', () => {
      const document = parse(PUBLISH_ANNOUNCEMENT_MUTATION);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('SCHEDULE_ANNOUNCEMENT_MUTATION is valid against live schema', () => {
      const document = parse(SCHEDULE_ANNOUNCEMENT_MUTATION);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('ARCHIVE_ANNOUNCEMENT_MUTATION is valid against live schema', () => {
      const document = parse(ARCHIVE_ANNOUNCEMENT_MUTATION);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('LIST_ANNOUNCEMENTS_QUERY is valid against live schema', () => {
      const document = parse(LIST_ANNOUNCEMENTS_QUERY);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('GET_ANNOUNCEMENT_QUERY is valid against live schema', () => {
      const document = parse(GET_ANNOUNCEMENT_QUERY);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('UPDATE_ANNOUNCEMENT_MUTATION is valid against live schema', () => {
      const document = parse(UPDATE_ANNOUNCEMENT_MUTATION);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });
  });

  describe('Project Queries', () => {
    it('GET_PROJECT_QUERY is valid against live schema', () => {
      const document = parse(GET_PROJECT_QUERY);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('LIST_PROJECTS_QUERY is valid against live schema', () => {
      const document = parse(LIST_PROJECTS_QUERY);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('UPDATE_PROJECT_MUTATION is valid against live schema', () => {
      const document = parse(UPDATE_PROJECT_MUTATION);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });
  });

  describe('Feedback Queries', () => {
    it('SEARCH_FEEDBACK_QUERY is valid against live schema', () => {
      const document = parse(SEARCH_FEEDBACK_QUERY);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('SEARCH_FEEDBACK uses Reaction enum (not String)', () => {
      assert.ok(
        SEARCH_FEEDBACK_QUERY.includes('$reaction: Reaction'),
        'Should use Reaction enum type'
      );
      assert.ok(
        !SEARCH_FEEDBACK_QUERY.includes('$reaction: String'),
        'Should not use String type for reaction'
      );
    });

    it('SEARCH_FEEDBACK uses Importance enum (not String)', () => {
      assert.ok(
        SEARCH_FEEDBACK_QUERY.includes('$importance: Importance'),
        'Should use Importance enum type'
      );
      assert.ok(
        !SEARCH_FEEDBACK_QUERY.includes('$importance: String'),
        'Should not use String type for importance'
      );
    });

    it('SEARCH_FEEDBACK queries email and initials fields', () => {
      assert.ok(
        SEARCH_FEEDBACK_QUERY.includes('email'),
        'Should query email field on affectedCustomer'
      );
      assert.ok(
        SEARCH_FEEDBACK_QUERY.includes('initials'),
        'Should query initials field on affectedCustomer'
      );
    });

    it('GET_FEEDBACK_QUERY is valid against live schema', () => {
      const document = parse(GET_FEEDBACK_QUERY);
      const errors = validate(schema, document);

      assert.strictEqual(
        errors.length,
        0,
        `Validation errors: ${errors.map(e => e.message).join(', ')}`
      );
    });
  });

  describe('Analytics Queries', () => {
    it('GET_TOP_ANNOUNCEMENTS_QUERY is valid against live schema', () => {
      const document = parse(GET_TOP_ANNOUNCEMENTS_QUERY);
      const errors = validate(schema, document);

      assert.strictEqual(errors.length, 0);
    });

    it('GET_TOP_ANNOUNCEMENTS uses correct analytics fields', () => {
      // Verify we're using the correct field structure
      assert.ok(
        GET_TOP_ANNOUNCEMENTS_QUERY.includes('viewerAnalytics'),
        'Should use viewerAnalytics object'
      );
      assert.ok(
        GET_TOP_ANNOUNCEMENTS_QUERY.includes('totalUniqueAnonymousCount'),
        'Should use correct viewer count field'
      );
      assert.ok(
        GET_TOP_ANNOUNCEMENTS_QUERY.includes('emailAnalytics'),
        'Should use emailAnalytics object'
      );
      assert.ok(
        !GET_TOP_ANNOUNCEMENTS_QUERY.includes('totalViews'),
        'Should not use old totalViews field'
      );
    });

    it('GET_TOP_ANNOUNCEMENTS uses direct feedback count fields', () => {
      assert.ok(
        GET_TOP_ANNOUNCEMENTS_QUERY.includes('feedbackHappyCount'),
        'Should use feedbackHappyCount field'
      );
      assert.ok(
        GET_TOP_ANNOUNCEMENTS_QUERY.includes('feedbackMehCount'),
        'Should use feedbackMehCount field'
      );
      assert.ok(
        GET_TOP_ANNOUNCEMENTS_QUERY.includes('feedbackSadCount'),
        'Should use feedbackSadCount field'
      );
    });
  });

  describe('Template Queries', () => {
    it('LIST_TEMPLATES_QUERY is valid against live schema', () => {
      const document = parse(LIST_TEMPLATES_QUERY);
      const errors = validate(schema, document);

      assert.strictEqual(
        errors.length,
        0,
        `Validation errors: ${errors.map(e => e.message).join(', ')}`
      );
    });

    it('LIST_TEMPLATES_QUERY filters out archived templates', () => {
      assert.ok(
        LIST_TEMPLATES_QUERY.includes('archived: false'),
        'Should filter archived: false at the GraphQL level'
      );
    });
  });
});
