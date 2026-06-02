# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an MCP (Model Context Protocol) server that provides tools for managing LaunchNotes projects and announcements through their GraphQL API. The server exposes 13 tools (6 for project management, 7 for announcement management).

The server uses stdio transport for command-line MCP clients like Claude Desktop.

## Development Commands

### Build and Run
```bash
# Build TypeScript to JavaScript
npm run build

# Start the server
npm start

# Development mode with auto-rebuild on changes
npm run dev
```

### Environment Setup
```bash
# Required environment variable
export LAUNCHNOTES_API_TOKEN='your-token-here'
```

Get your API token from LaunchNotes Settings → API. Use a Management token for read/write operations or a Public token for read-only access.

### Mise
There are two files, mise.toml and mise.local.toml that define our env, tools and tasks.

## Architecture

### Core Design Patterns

**Resource-Based Module Organization:**
- Each resource (projects, announcements) is a self-contained module
- Shared infrastructure (GraphQL client, constants) in `src/shared/`
- Single GraphQL client with `execute()` method used by all resources

**Per-Resource Architecture:**
Each resource module (`src/projects/`, `src/announcements/`) contains:
1. **types.ts**: TypeScript interfaces for the resource
2. **queries.ts**: GraphQL query strings + operation functions
3. **schemas.ts**: Zod schemas for input validation
4. **formatters.ts**: Markdown/JSON formatting functions
5. **tools.ts**: MCP tool registrations

**Data Flow:**
```
User → stdio Transport → MCP Server → Tool Handler → Zod Validation →
Query Operation → GraphQL Client → LaunchNotes API → Formatter → User
```

### Key Architectural Decisions

**Validation Strategy:** All tool inputs are validated twice:
- Zod schema validation at tool entry (runtime type checking)
- GraphQL validation at API layer (business logic validation)

**Error Handling:** Errors are caught at multiple levels:
- Network/timeout errors in the GraphQL client
- GraphQL errors returned from API
- Validation errors from Zod schemas
All errors return structured `{ isError: true, content: [...] }` responses

**Response Formatting:** Tools support two output formats:
- `json`: Raw data for programmatic processing
- `markdown`: Human-readable formatted text (default)

**Stateless Design:** The server maintains no state between requests. Each request is independent, making it safe for concurrent operations.

### Shared Layer (`src/shared/`)

**GraphQLClient** (`client.ts`): Single client class for all GraphQL operations
- `execute<T>(query, variables)`: Generic method for all queries/mutations
- Handles authentication (Bearer token)
- Handles timeouts (30s), rate limiting (300 ops/5min)
- Transforms errors (401, 429, timeouts, GraphQL errors)

**Important:** All GraphQL operations use this single client. Never create separate clients per resource.

### Query Layer (`queries.ts` in each resource)

GraphQL operations are colocated with their resource:
- Define GraphQL query/mutation strings as constants
- Export operation functions: `async function getProject(client: GraphQLClient, id: string)`
- Operation functions take client as first parameter
- Return typed responses using interfaces from `types.ts`

```typescript
export const GET_PROJECT_QUERY = `query GetProject($id: ID!) { ... }`;

export async function getProject(
  client: GraphQLClient,
  projectId: string
): Promise<{ project: LaunchNotesProject }> {
  return client.execute(GET_PROJECT_QUERY, { id: projectId });
}
```

### Schema Layer (`schemas.ts` in each resource)

Zod schemas enforce input validation. Key patterns:
- Use `.strict()` on all schemas to reject extra fields
- Use `.refine()` for cross-field validation (e.g., "at least one field required")
- Define hex color validation: `z.string().regex(/^#[0-9A-Fa-f]{6}$/)`
- Always export both schema and inferred type: `export type FooInput = z.infer<typeof FooSchema>`

### Tool Layer (`tools.ts` in each resource)

Tool implementations follow a consistent pattern:

```typescript
export function registerProjectTools(server: McpServer, client: GraphQLClient) {
  server.registerTool(
    "tool_name",
    { title, description, inputSchema, annotations },
    async (input) => {
      try {
        const result = await getProject(client, input.project_id);
        const formatted = formatProjectMarkdown(result.project);
        return { content: [{ type: "text", text: formatted }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: errorMessage }] };
      }
    }
  );
}
```

**Tool Annotations:** Always set these metadata flags:
- `readOnlyHint`: true for read operations, false for mutations
- `destructiveHint`: false (LaunchNotes API doesn't support destructive operations like delete)
- `idempotentHint`: true for reads, false for writes
- `openWorldHint`: true (tools work with any valid project/announcement)

## File Organization

```
src/
├── index.ts              # Server initialization and tool registration
│
├── shared/               # Shared infrastructure
│   ├── client.ts         # Single GraphQL client with execute() method
│   ├── constants.ts      # API URL, response format enums
│   └── types.ts          # GraphQL response types
│
├── projects/             # Project resource module
│   ├── types.ts          # Project TypeScript interfaces
│   ├── queries.ts        # GraphQL queries + operation functions
│   ├── schemas.ts        # Zod validation schemas (6 tools)
│   ├── formatters.ts     # Markdown/JSON formatting
│   └── tools.ts          # MCP tool registrations (6 tools)
│
└── announcements/        # Announcement resource module
    ├── types.ts          # Announcement TypeScript interfaces
    ├── queries.ts        # GraphQL queries + operation functions
    ├── schemas.ts        # Zod validation schemas (7 tools)
    ├── formatters.ts     # Markdown/JSON formatting
    └── tools.ts          # MCP tool registrations (7 tools)
```

## Adding New Tools

Follow this workflow when adding new functionality:

### Adding to Existing Resource (e.g., Projects)

1. **Add Types** (`src/projects/types.ts`):
   ```typescript
   export interface NewProjectData {
     // ... new fields
   }
   ```

2. **Add Query** (`src/projects/queries.ts`):
   ```typescript
   export const NEW_OPERATION_QUERY = `query NewOp($id: ID!) { ... }`;

   export async function newOperation(
     client: GraphQLClient,
     projectId: string
   ): Promise<{ ... }> {
     return client.execute(NEW_OPERATION_QUERY, { id: projectId });
   }
   ```

3. **Add Schema** (`src/projects/schemas.ts`):
   ```typescript
   export const NewOperationSchema = z.object({
     project_id: z.string().describe("Project ID"),
     // ... other fields
   }).strict();

   export type NewOperationInput = z.infer<typeof NewOperationSchema>;
   ```

4. **Add Formatter** (if needed) (`src/projects/formatters.ts`):
   ```typescript
   export function formatNewDataMarkdown(data: NewProjectData): string {
     // ... formatting logic
   }
   ```

5. **Add Tool** (`src/projects/tools.ts`):
   ```typescript
   server.registerTool(
     "launchnotes_new_operation",
     { title, description, inputSchema: NewOperationSchema, annotations },
     async (input) => {
       const result = await newOperation(client, input.project_id);
       return { content: [{ type: "text", text: formatNewDataMarkdown(result) }] };
     }
   );
   ```

### Adding New Resource Category

Create a new directory `src/categories/` with:
1. `types.ts` - Category interfaces
2. `queries.ts` - GraphQL operations
3. `schemas.ts` - Zod validation
4. `formatters.ts` - Formatting functions
5. `tools.ts` - Tool registrations

Then register in `src/index.ts`:
```typescript
import { registerCategoryTools } from "./categories/tools.js";
// ...
registerCategoryTools(server, client);
```

## Common Patterns

### Markdown Formatting

Use consistent markdown formatting for human-readable output:
- Start with `# Heading` for main title
- Use `**Bold:**` for field labels
- Use code blocks with triple backticks for long code/content
- Truncate long fields with `...` and note the truncation

### Error Messages

Provide actionable error messages:
- "Authentication failed. Please check your API token." (401)
- "Rate limit exceeded. LaunchNotes allows 300 operations per 5 minutes." (429)
- "Request timeout. Please try again." (timeout)
- Include GraphQL error messages when available

### GraphQL Queries

Structure queries consistently:
- Name queries/mutations descriptively (`GetProject`, `UpdateAnnouncement`)
- Request only needed fields (avoid `...`)
- Use variables for all dynamic values
- Keep queries in the client methods, not in tool implementations

## LaunchNotes API Details

**Base URL:** `https://app.launchnotes.io/graphql`

**Authentication:** Bearer token in `Authorization` header

**Rate Limiting:** 300 operations per 5 minutes (enforced by LaunchNotes)

**Response Structure:**
```json
{
  "data": { /* query results */ },
  "errors": [ /* GraphQL errors if any */ ]
}
```

**Mutation Pattern:** All mutations return:
```json
{
  "mutation_name": {
    "resource": { /* updated resource */ },
    "errors": [ /* validation errors if any */ ]
  }
}
```

## Testing

Manual testing approaches:

1. **Claude Desktop Integration:** Configure in `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "launchnotes": {
         "command": "npx",
         "args": ["-y", "@launchnotes/mcp"],
         "env": {
           "LAUNCHNOTES_API_TOKEN": "your-token-here"
         }
       }
     }
   }
   ```

2. **Common Test Scenarios:**
   - List projects (read-only, should always work)
   - Get specific project details
   - Update project settings (requires Management token)
   - Create/publish announcements
   - Error cases: invalid IDs, missing fields, rate limiting

## Important Constraints

**No Tests:** This project has no automated tests. Rely on TypeScript type checking and manual testing.

**No Logging:** Minimal console output. Avoid logging sensitive data (API tokens, user content).

**ESM Only:** The project uses ES modules (`"type": "module"`). Use `.js` extensions in imports, not `.ts`.

**No Delete Operations:** LaunchNotes API doesn't support deletion via GraphQL. Archive is the closest operation.

**Hex Colors Only:** All color fields must be in `#RRGGBB` format. Validate with regex.
