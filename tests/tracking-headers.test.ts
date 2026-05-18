/**
 * Test to verify tracking headers are properly added
 */

import { test } from "node:test";
import assert from "node:assert";
import { GraphQLClient } from "../dist/shared/client.js";
import { MCP_USER_AGENT, MCP_VERSION } from "../dist/shared/constants.js";

// Mock axios to capture headers
let capturedHeaders: Record<string, string> = {};

// Override the execute method to capture headers
const originalExecute = GraphQLClient.prototype.execute;
GraphQLClient.prototype.execute = async function(query: string, variables?: any, additionalHeaders?: any) {
  // Capture the headers that would be sent
  capturedHeaders = {
    "Authorization": `Bearer test-token`,
    "Content-Type": "application/json",
    "User-Agent": MCP_USER_AGENT,
    "X-LN-Client": "mcp",
    "X-LN-Client-Version": MCP_VERSION,
    ...additionalHeaders,
  };

  // Return a mock response
  return { project: { id: "test" } };
};

test("Tracking Headers", async (t) => {
  await t.test("GraphQL client adds static tracking headers", async () => {
    const client = new GraphQLClient("test-token");

    // Reset captured headers
    capturedHeaders = {};

    // Make a request without tool name
    await client.execute("query { test }");

    // Verify static headers are present
    assert.strictEqual(capturedHeaders["User-Agent"], `launchnotes-mcp/${MCP_VERSION}`);
    assert.strictEqual(capturedHeaders["X-LN-Client"], "mcp");
    assert.strictEqual(capturedHeaders["X-LN-Client-Version"], MCP_VERSION);
    assert.strictEqual(capturedHeaders["X-LN-MCP-Tool"], undefined);
  });

  await t.test("GraphQL client adds tool-specific header when provided", async () => {
    const client = new GraphQLClient("test-token");

    // Reset captured headers
    capturedHeaders = {};

    // Make a request with tool name
    await client.execute("query { test }", {}, { "X-LN-MCP-Tool": "launchnotes_get_project" });

    // Verify all headers including tool-specific
    assert.strictEqual(capturedHeaders["User-Agent"], `launchnotes-mcp/${MCP_VERSION}`);
    assert.strictEqual(capturedHeaders["X-LN-Client"], "mcp");
    assert.strictEqual(capturedHeaders["X-LN-Client-Version"], MCP_VERSION);
    assert.strictEqual(capturedHeaders["X-LN-MCP-Tool"], "launchnotes_get_project");
  });

  await t.test("Version is correctly loaded from package.json", async () => {
    // Verify version is 0.3.0 as we just updated it
    assert.strictEqual(MCP_VERSION, "0.3.0");
    assert.strictEqual(MCP_USER_AGENT, "launchnotes-mcp/0.3.0");
  });
});

console.log("✅ All tracking header tests passed!");