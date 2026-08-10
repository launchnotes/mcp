# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an MCP (Model Context Protocol) server that provides tools for managing LaunchNotes projects and announcements through their GraphQL API. The server exposes 22 tools across 7 resource categories:

- **Projects** (6 tools) - Project configuration and management
- **Announcements** (7 tools) - Announcement lifecycle management
- **Feedback** (2 tools) - Customer feedback search and retrieval
- **Analytics** (1 tool) - Performance metrics and top announcements
- **Templates** (1 tool) - Announcement template management
- **Roadmap** (4 tools) - Roadmap stages and work item management
- **Links** (1 tool) - External content attachments

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

## Available Tools

The server provides 22 tools organized into 7 resource categories. Each tool is prefixed with `launchnotes_` for easy identification.

### Projects (6 tools)
- **`launchnotes_get_project`** - Retrieve complete project details including all customization settings, colors, custom code, and feature flags
- **`launchnotes_list_projects`** - List all LaunchNotes projects accessible with the current API token
- **`launchnotes_update_project_custom_code`** - Update custom CSS, HTML head, header, footer, or index hero for a project
- **`launchnotes_update_project_colors`** - Update color palette and theme (all colors in hex format)
- **`launchnotes_update_project_content`** - Update project title, description, headings, and slug
- **`launchnotes_update_project_features`** - Enable/disable features (feedback, roadmap, ideas, RSS, voting, SEO indexing)

### Announcements (7 tools)
- **`launchnotes_list_announcements`** - List announcements with filtering by state and ordering options
- **`launchnotes_get_announcement`** - Retrieve complete details for a specific announcement
- **`launchnotes_create_announcement`** - Create a new draft announcement (supports Markdown, HTML, or Jira syntax)
- **`launchnotes_update_announcement`** - Update an existing announcement's content, metadata, or categorization
- **`launchnotes_publish_announcement`** - Publish an announcement immediately
- **`launchnotes_schedule_announcement`** - Schedule an announcement for automatic future publishing
- **`launchnotes_archive_announcement`** - Archive an announcement (removes from active list while preserving content)

### Feedback (2 tools)
- **`launchnotes_search_feedback`** - Search and filter customer feedback by sentiment, importance, organized state, starred status
- **`launchnotes_get_feedback`** - Retrieve complete details for a specific feedback item

### Analytics (1 tool)
- **`launchnotes_get_top_announcements`** - Get top-performing announcements ranked by various metrics (engagement, open rate, click rate, feedback count, sentiment)

### Templates (1 tool)
- **`launchnotes_list_templates`** - List available announcement templates for a project

### Roadmap (4 tools)
- **`launchnotes_list_stages`** - List roadmap stages in their on-roadmap order
- **`launchnotes_list_work_items`** - List work items on the roadmap, optionally filtered by stage
- **`launchnotes_move_work_item`** - Move a work item between roadmap stages
- **`launchnotes_create_work_item`** - Create a new work item on the roadmap

### Links (1 tool)
- **`launchnotes_create_external_content_link`** - Attach supporting links (blog posts, docs, videos) to announcements

## Architecture

### Core Design Patterns

**Resource-Based Module Organization:**
- Each resource (projects, announcements, feedback, analytics, templates, roadmap, links) is a self-contained module
- Shared infrastructure (GraphQL client, constants) in `src/shared/`
- Single GraphQL client with `execute()` method used by all resources

**Per-Resource Architecture:**
Each resource module (`src/projects/`, `src/announcements/`, `src/feedback/`, etc.) contains:
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
- `destructiveHint`: true for write operations (mutations that modify or create data), false for read operations. Note: the MCP spec default is true; we explicitly set false only on read tools.
- `idempotentHint`: true for reads, false for writes
- `openWorldHint`: true (tools work with any valid project/announcement)

## File Organization

```
src/
├── index.ts              # Server initialization and tool registration (22 tools)
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
├── announcements/        # Announcement resource module
│   ├── types.ts          # Announcement TypeScript interfaces
│   ├── queries.ts        # GraphQL queries + operation functions
│   ├── schemas.ts        # Zod validation schemas (7 tools)
│   ├── formatters.ts     # Markdown/JSON formatting
│   └── tools.ts          # MCP tool registrations (7 tools)
│
├── feedback/             # Feedback resource module
│   ├── types.ts          # Feedback TypeScript interfaces
│   ├── queries.ts        # GraphQL queries + operation functions
│   ├── schemas.ts        # Zod validation schemas (2 tools)
│   ├── formatters.ts     # Markdown/JSON formatting
│   └── tools.ts          # MCP tool registrations (2 tools)
│
├── analytics/            # Analytics resource module
│   ├── types.ts          # Analytics TypeScript interfaces
│   ├── queries.ts        # GraphQL queries + operation functions
│   ├── schemas.ts        # Zod validation schemas (1 tool)
│   ├── formatters.ts     # Markdown/JSON formatting
│   └── tools.ts          # MCP tool registrations (1 tool)
│
├── templates/            # Templates resource module
│   ├── types.ts          # Template TypeScript interfaces
│   ├── queries.ts        # GraphQL queries + operation functions
│   ├── schemas.ts        # Zod validation schemas (1 tool)
│   ├── formatters.ts     # Markdown/JSON formatting
│   └── tools.ts          # MCP tool registrations (1 tool)
│
├── roadmap/              # Roadmap resource module
│   ├── types.ts          # Roadmap TypeScript interfaces
│   ├── queries.ts        # GraphQL queries + operation functions
│   ├── schemas.ts        # Zod validation schemas (4 tools)
│   ├── formatters.ts     # Markdown/JSON formatting
│   └── tools.ts          # MCP tool registrations (4 tools)
│
└── links/                # Links resource module
    ├── types.ts          # Link TypeScript interfaces
    ├── queries.ts        # GraphQL queries + operation functions
    ├── schemas.ts        # Zod validation schemas (1 tool)
    ├── formatters.ts     # Markdown/JSON formatting
    └── tools.ts          # MCP tool registrations (1 tool)
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

Create a new directory following the established pattern (e.g., `src/feedback/`, `src/roadmap/`, `src/analytics/`) with:
1. `types.ts` - Resource interfaces
2. `queries.ts` - GraphQL operations
3. `schemas.ts` - Zod validation
4. `formatters.ts` - Formatting functions
5. `tools.ts` - Tool registrations

Then register in `src/index.ts`:
```typescript
import { registerFeedbackTools } from "./feedback/tools.js";
import { registerRoadmapTools } from "./roadmap/tools.js";
// ... other imports

// In the server initialization:
registerFeedbackTools(server, client);
registerRoadmapTools(server, client);
```

Example from the Roadmap module:
- `src/roadmap/types.ts` - Defines `Stage`, `WorkItem` interfaces
- `src/roadmap/queries.ts` - Contains `LIST_STAGES_QUERY`, `MOVE_WORK_ITEM_MUTATION`
- `src/roadmap/schemas.ts` - Defines `ListStagesSchema`, `MoveWorkItemSchema`
- `src/roadmap/formatters.ts` - Implements `formatStagesMarkdown()`, `formatWorkItemsMarkdown()`
- `src/roadmap/tools.ts` - Registers 4 tools with proper annotations

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
