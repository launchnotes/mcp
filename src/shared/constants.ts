/**
 * Shared Constants
 */

// Import package.json for version info
// Note: Using require since JSON imports with assert are not always supported
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageJson = require("../../package.json");

export const API_URL = "https://app.launchnotes.io/graphql";

export const RESPONSE_FORMAT = {
  JSON: "json",
  MARKDOWN: "markdown",
} as const;

// MCP tracking constants
export const MCP_NAME = packageJson.name; // "@launchnotes/mcp"
export const MCP_VERSION = packageJson.version; // "0.2.1"
export const MCP_USER_AGENT = `launchnotes-mcp/${MCP_VERSION}`;
