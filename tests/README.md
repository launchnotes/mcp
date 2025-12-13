# LaunchNotes MCP Server Tests

Comprehensive test suite for the LaunchNotes MCP server with **zero API side effects**.

## Test Architecture

### Two Test Types

1. **Schema Validation Tests** (`schema-validation.test.ts`)
   - Fetches the live GraphQL schema via introspection query (1 API call)
   - Validates all GraphQL queries/mutations against the current schema
   - Ensures code stays compatible with LaunchNotes API changes
   - **No side effects** - only reads the schema

2. **Unit Tests** (`announcements.test.ts`, `projects.test.ts`, `feedback.test.ts`, `analytics.test.ts`)
   - Mock all GraphQL operations
   - **Zero API calls** - completely isolated
   - Test parameter mapping and response handling
   - Fast execution (~0.5 seconds)

## Running Tests

```bash
# Run all tests (schema + unit)
npm test

# Schema validation only (1 API call to fetch schema)
npm run test:schema

# Unit tests only (no API calls)
npm run test:unit

# Watch mode
npm run test:watch
```

## Test Results

```
✓ 52 tests pass
  ├─ 18 schema validation tests
  └─ 34 unit tests

✓ All operations mocked (except schema introspection)
✓ Zero side effects
✓ Fast execution (~1.5 seconds total)
```

## Why This Approach?

### Schema Validation Against Live API

Instead of storing a schema copy, we fetch the current schema at test time. This ensures:
- Tests always validate against the **current** API (no drift)
- Immediate detection of breaking changes
- No stale schema files to maintain

### Mocked Operations

All create/update/delete operations are mocked because:
- **Fast** - No network latency
- **Safe** - No test data created in LaunchNotes
- **Reliable** - No rate limits or API dependencies
- **Isolated** - Tests don't affect each other

## CI/CD Integration

Tests run automatically on:
- Every push to main
- Every pull request
- Daily at 9am UTC (catches API changes)

See `.github/workflows/test.yml` for configuration.

## Test Coverage

### Announcements
- ✓ Create with Markdown/HTML/Jira content
- ✓ Publish/schedule/archive mutations
- ✓ List and get operations
- ✓ Update announcements
- ✓ All parameters validated

### Projects
- ✓ Get and list projects
- ✓ Update project settings
- ✓ Correct mutation structure

### Feedback
- ✓ Search with filters (reaction, importance, starred, archived)
- ✓ Enum type validation (Reaction, Importance)
- ✓ Pagination support
- ✓ Get single feedback item

### Analytics
- ✓ Get top announcements
- ✓ Multiple sorting metrics (engagement, open_rate, etc.)
- ✓ Calculated metrics (totalViewers, averageSentiment)
- ✓ Response transformation

## Adding New Tests

### For New Queries/Mutations

1. Add schema validation test in `schema-validation.test.ts`:
```typescript
it('NEW_QUERY is valid against live schema', () => {
  const document = parse(NEW_QUERY);
  const errors = validate(schema, document);
  assert.strictEqual(errors.length, 0);
});
```

2. Add unit tests in appropriate file:
```typescript
it('sends correct parameters', async () => {
  let capturedVariables: any;
  mockExecute = mock.fn(async (query, variables) => {
    capturedVariables = variables;
    return MockFactory.mutationResponse(...);
  });

  await YourQuery.operation(client, params);
  assert.strictEqual(capturedVariables.param, expected);
});
```

## Dependencies

- `graphql` (^16.9.0) - Schema validation
- `tsx` (^4.19.2) - TypeScript execution
- `node:test` - Built-in Node.js test runner (no external test framework)

## Benefits

✓ **Always current** - Tests validate against live API schema
✓ **Fast** - Unit tests run in ~0.5 seconds
✓ **Safe** - No test data created in production
✓ **Comprehensive** - 52 tests covering all operations
✓ **Zero dependencies** - Uses built-in Node.js test runner
✓ **CI/CD ready** - Automatic validation of schema changes
