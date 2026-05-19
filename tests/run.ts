#!/usr/bin/env node
/**
 * Test Runner
 *
 * Runs tests with different configurations:
 * - npm test              → All tests (schema validation + unit tests)
 * - npm run test:schema   → Only schema validation (hits live API)
 * - npm run test:unit     → Only unit tests (all mocked, no API calls)
 */

import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    'schema-only': { type: 'boolean', default: false },
    'unit-only': { type: 'boolean', default: false },
  },
  strict: false,
});

let files: string[];

if (values['schema-only']) {
  console.log('🔍 Running schema validation tests only...');
  console.log('   (This will fetch the live schema via introspection query)\n');
  files = ['tests/schema-validation.test.ts'];
} else if (values['unit-only']) {
  console.log('🧪 Running unit tests only...');
  console.log('   (All operations are mocked, no API calls)\n');
  files = [
    'tests/announcements.test.ts',
    'tests/projects.test.ts',
    'tests/feedback.test.ts',
    'tests/analytics.test.ts',
    'tests/templates.test.ts',
    'tests/roadmap.test.ts',
    'tests/links.test.ts',
  ];
} else {
  console.log('🚀 Running all tests...');
  console.log('   - Schema validation (1 API call to fetch schema)');
  console.log('   - Unit tests (all mocked)\n');
  files = [
    'tests/schema-validation.test.ts',
    'tests/announcements.test.ts',
    'tests/projects.test.ts',
    'tests/feedback.test.ts',
    'tests/analytics.test.ts',
    'tests/templates.test.ts',
    'tests/roadmap.test.ts',
    'tests/links.test.ts',
  ];
}

// Run tests
const stream = run({ files });
stream.compose(spec).pipe(process.stdout);

// Handle test completion
stream.on('test:fail', () => {
  process.exitCode = 1;
});
