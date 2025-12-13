/**
 * Schema Fetcher - Fetches live schema via introspection
 * This is the ONLY test utility that hits the live API
 */

import { GraphQLClient } from '../../src/shared/client.js';
import { buildClientSchema, GraphQLSchema } from 'graphql';

let cachedSchema: GraphQLSchema | null = null;

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      types {
        ...FullType
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        name
        description
        type { ...TypeRef }
        defaultValue
      }
      type { ...TypeRef }
      isDeprecated
      deprecationReason
    }
    inputFields {
      name
      description
      type { ...TypeRef }
      defaultValue
    }
    interfaces { ...TypeRef }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes { ...TypeRef }
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches the live schema once and caches it for the test run
 */
export async function getLiveSchema(): Promise<GraphQLSchema> {
  if (cachedSchema) {
    return cachedSchema;
  }

  const apiToken = process.env.LAUNCHNOTES_API_TOKEN;
  if (!apiToken) {
    throw new Error('LAUNCHNOTES_API_TOKEN environment variable is required for schema validation tests');
  }

  console.log('  → Fetching live schema from LaunchNotes API...');
  const client = new GraphQLClient(apiToken);
  const result = await client.execute(INTROSPECTION_QUERY, {});

  // The GraphQLClient returns the data directly, not wrapped in { data: ... }
  if (!result.__schema) {
    throw new Error('Failed to fetch schema: Invalid introspection response');
  }

  cachedSchema = buildClientSchema(result);
  console.log('  → Schema fetched successfully');
  return cachedSchema;
}

/**
 * Reset cached schema (useful for test cleanup)
 */
export function resetSchemaCache(): void {
  cachedSchema = null;
}
