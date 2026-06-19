#!/usr/bin/env node

/**
 * LaunchNotes MCP Server
 *
 * An MCP server for managing LaunchNotes projects through the GraphQL API.
 * Provides tools for updating project settings, colors, custom code, and features.
 *
 * Runs in stdio mode for command-line MCP clients like Claude Desktop.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "./shared/client.js";
import { MCP_NAME, MCP_VERSION } from "./shared/constants.js";
import { registerProjectTools } from "./projects/tools.js";
import { registerAnnouncementTools } from "./announcements/tools.js";
import { registerFeedbackTools } from "./feedback/tools.js";
import { registerAnalyticsTools } from "./analytics/tools.js";
import { registerTemplateTools } from "./templates/tools.js";
import { registerRoadmapTools } from "./roadmap/tools.js";
import { registerLinkTools } from "./links/tools.js";

/**
 * Factory function to create a configured MCP server instance
 */
function createServer(apiToken: string): McpServer {
  // Create LaunchNotes client
  const client = createClient(apiToken);

  // Create MCP server with dynamic version from package.json
  const server = new McpServer({
    name: MCP_NAME,
    version: MCP_VERSION,
  });

  // Register all project tools
  registerProjectTools(server, client);

  // Register all announcement tools
  registerAnnouncementTools(server, client);

  // Register all feedback tools (Phase 1 MVP)
  registerFeedbackTools(server, client);

  // Register all analytics tools (Phase 1 MVP)
  registerAnalyticsTools(server, client);

  // Register all template tools
  registerTemplateTools(server, client);

  // Register all roadmap tools
  registerRoadmapTools(server, client);

  // Register all external content link tools
  registerLinkTools(server, client);

  return server;
}

/**
 * Start server in stdio mode (for command-line MCP clients)
 */
async function startStdio(apiToken: string) {
  const server = createServer(apiToken);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("✓ LaunchNotes MCP Server running in stdio mode");
  console.error("✓ Registered tools: 22 tools (6 project + 7 announcement + 2 feedback + 1 analytics + 1 template + 4 roadmap + 1 link)");
}

/**
 * Main server initialization
 */
async function main() {
  // Get API token from environment
  const apiToken = process.env.LAUNCHNOTES_API_TOKEN;

  if (!apiToken) {
    console.error("Error: LAUNCHNOTES_API_TOKEN environment variable is required");
    console.error("\nUsage:");
    console.error("  export LAUNCHNOTES_API_TOKEN='your-token-here'");
    console.error("  npm start");
    process.exit(1);
  }

  await startStdio(apiToken);
}

// Start the server
main().catch((error) => {
  console.error("Failed to start LaunchNotes MCP Server:", error);
  process.exit(1);
});
