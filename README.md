# LaunchNotes MCP Server

> [!WARNING]
> **This server is frozen.** LaunchNotes MCP is now a **hosted** server — you log in with your LaunchNotes account (no API token), and your assistant acts as *you* with your role's permissions, plus a bigger tool set and **skills**.
>
> **→ Get the new version: [launchnotes/mcp-server-guide](https://github.com/launchnotes/mcp-server-guide)** — one install for Claude Code, Claude Desktop, and Cursor.
>
> This npm/stdio server keeps working and stays **supported for scripting & automation**, but it gets no new tools or fixes.

An MCP (Model Context Protocol) server for managing LaunchNotes projects and announcements through the GraphQL API. Uses stdio transport for Claude Desktop and other MCP clients.

## Features

**Project Management (6 tools)**
- Get complete project details
- List all accessible projects
- Update custom CSS, HTML, headers, and footers
- Update project color palette and theme
- Update project content (title, description, slug)
- Toggle project features (feedback, roadmap, ideas, RSS, voting)

**Announcement Management (7 tools)**
- List and filter announcements
- Get announcement details
- Create new announcements
- Update existing announcements
- Publish announcements immediately
- Schedule announcements for future publication
- Archive announcements

**Feedback Management (2 tools)** 🆕
- Search and filter customer feedback
- Get complete feedback details with customer info

**Analytics (1 tool)** 🆕
- Get top-performing announcements by various metrics

## Installation

> **For everyday use** in Claude Code, Claude Desktop, or Cursor, use the new hosted server — see **[launchnotes/mcp-server-guide](https://github.com/launchnotes/mcp-server-guide)**. The steps below are the legacy npm/stdio path, kept for **scripting & automation**.

### From npm (legacy)

```bash
npm install -g @launchnotes/mcp
```

### From Source

```bash
git clone https://github.com/launchnotes/mcp.git
cd mcp
npm install
npm run build
```

## Quick Start

### 1. Get Your API Token

Get your LaunchNotes API token from **Settings → API** in your LaunchNotes dashboard. Use a Management token for full access or a Public token for read-only operations.

### 2. Add to Claude Desktop

Add to your Claude Desktop config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

Then restart Claude Desktop.

### 3. Add to Claude Code

```bash
claude mcp add --transport stdio launchnotes \
  --env LAUNCHNOTES_API_TOKEN='your-token-here' \
  -- npx -y @launchnotes/mcp
```

### 4. Start Using

In Claude, simply ask:
```
List my LaunchNotes projects
Create a new announcement about our API update
```

**Getting your API token:**
- Log into LaunchNotes
- Navigate to Settings → API
- Generate a Management token (read/write access) or Public token (read-only)

## Available Tools

### 1. `launchnotes_get_project`

Get complete details for a LaunchNotes project including all customization settings.

**Parameters:**
- `project_id` (string, required): The project ID
- `response_format` ('json' | 'markdown', optional): Output format (default: 'markdown')

**Example:**
```json
{
  "project_id": "proj_123",
  "response_format": "markdown"
}
```

**Use cases:**
- "Show me my project's current custom CSS"
- "What are the color values for my project?"
- "Get all settings for project proj_123"

---

### 2. `launchnotes_list_projects`

List all LaunchNotes projects accessible with your API token.

**Parameters:**
- `response_format` ('json' | 'markdown', optional): Output format (default: 'markdown')

**Example:**
```json
{
  "response_format": "json"
}
```

**Use cases:**
- "Show me all my LaunchNotes projects"
- "List my organization's projects"
- "What projects do I have access to?"

---

### 3. `launchnotes_update_project_custom_code`

Update custom CSS, HTML head, header, footer, or index hero for a project.

**Parameters:**
- `project_id` (string, required): The project ID
- `custom_css` (string, optional): Custom CSS code
- `custom_head` (string, optional): Custom HTML for `<head>` section
- `custom_header` (string, optional): Custom HTML for page header
- `custom_footer` (string, optional): Custom HTML for page footer
- `custom_index_hero` (string, optional): Custom HTML for index hero section

*Note: At least one custom code field must be provided.*

**Example:**
```json
{
  "project_id": "proj_123",
  "custom_css": ".sidebar { display: none; }",
  "custom_head": "<meta name=\"description\" content=\"Product updates\">"
}
```

**Use cases:**
- "Add custom CSS to hide the sidebar"
- "Update the custom header HTML"
- "Set custom analytics code in the head"

---

### 4. `launchnotes_update_project_colors`

Update the color palette and theme for a project. All colors must be in hex format.

**Parameters:**
- `project_id` (string, required): The project ID
- `primary_color` (string, optional): Primary brand color (hex)
- `secondary_color` (string, optional): Secondary brand color (hex)
- `primary_text_color` (string, optional): Primary text color (hex)
- `secondary_text_color` (string, optional): Secondary text color (hex)
- `gray_color` (string, optional): Gray accent color (hex)
- `light_gray_color` (string, optional): Light gray color (hex)
- `off_white_color` (string, optional): Off-white color (hex)
- `white_color` (string, optional): White color (hex)
- `supporting_palette` (string, optional): Supporting palette config
- `color_theme` (string, optional): Overall color theme identifier

*Note: At least one color field must be provided. All colors must be in hex format (e.g., #FF5733).*

**Example:**
```json
{
  "project_id": "proj_123",
  "primary_color": "#FF5733",
  "secondary_color": "#3498DB",
  "primary_text_color": "#2C3E50"
}
```

**Use cases:**
- "Change the primary color to #FF5733"
- "Update all brand colors for my project"
- "Set text colors to improve readability"

---

### 5. `launchnotes_update_project_content`

Update project title, description, headings, and slug.

**Parameters:**
- `project_id` (string, required): The project ID
- `name` (string, optional): Internal project name
- `title` (string, optional): Public-facing project title
- `description` (string, optional): Project description
- `heading` (string, optional): Main heading on the project page
- `subheading` (string, optional): Subheading below the main heading
- `slug` (string, optional): URL-friendly identifier (lowercase, hyphens only)

*Note: At least one content field must be provided.*

**Example:**
```json
{
  "project_id": "proj_123",
  "title": "Product Updates",
  "heading": "What's New",
  "slug": "updates"
}
```

**Use cases:**
- "Update project title to 'Product Updates'"
- "Change the heading and subheading"
- "Update the project slug"

---

### 6. `launchnotes_update_project_features`

Enable or disable features for a project.

**Parameters:**
- `project_id` (string, required): The project ID
- `feedback_enabled` (boolean, optional): Enable/disable feedback collection
- `roadmap_enabled` (boolean, optional): Enable/disable roadmap feature
- `ideas_enabled` (boolean, optional): Enable/disable ideas/feature requests
- `rss_feed_enabled` (boolean, optional): Enable/disable RSS feed
- `voting_enabled` (boolean, optional): Enable/disable voting on ideas
- `noindex` (boolean, optional): Prevent search engine indexing (true = disabled SEO)

*Note: At least one feature toggle must be provided.*

**Example:**
```json
{
  "project_id": "proj_123",
  "feedback_enabled": true,
  "roadmap_enabled": true,
  "voting_enabled": true
}
```

**Use cases:**
- "Enable feedback collection for my project"
- "Turn on the roadmap feature"
- "Disable RSS feed"

---

### 7. `launchnotes_search_feedback` 🆕

Search and filter customer feedback in a LaunchNotes project.

**Parameters:**
- `project_id` (string, required): The ID of the project
- `query` (string, optional): Search term to find in feedback content
- `reaction` ('happy' | 'meh' | 'sad', optional): Filter by customer sentiment
- `importance` ('low' | 'medium' | 'high', optional): Filter by importance level
- `organized_state` (string, optional): Filter by state ('organized', 'unorganized', 'announcement', 'idea', 'roadmap')
- `start_date` (string, optional): Filter feedback created after this date (ISO 8601)
- `end_date` (string, optional): Filter feedback created before this date (ISO 8601)
- `limit` (number, optional): Number to return (max 100, default: 20)
- `response_format` ('json' | 'markdown', optional): Output format (default: 'markdown')

**Example:**
```json
{
  "project_id": "proj_123",
  "query": "Digests",
  "reaction": "sad",
  "importance": "high",
  "limit": 10
}
```

**Use cases:**
- "What are customers saying about Digests?"
- "Show me all unhappy feedback from last month"
- "Find high importance feedback that's unorganized"
- "Search feedback containing 'API integration'"

---

### 8. `launchnotes_get_feedback` 🆕

Get complete details for a specific feedback item including customer info and associations.

**Parameters:**
- `feedback_id` (string, required): The ID of the feedback item
- `response_format` ('json' | 'markdown', optional): Output format (default: 'markdown')

**Example:**
```json
{
  "feedback_id": "fb_abc123",
  "response_format": "markdown"
}
```

**Returns:**
- Content and internal notes
- Sentiment (reaction) and importance
- Affected customer information
- Reporter information
- Associated announcement/idea/work item
- Timestamps

**Use cases:**
- "Show me details for feedback #abc123"
- "Get the full context of this feedback item"
- "What announcement is this feedback associated with?"

---

### 9. `launchnotes_get_top_announcements` 🆕

Get top-performing announcements ranked by various metrics over a specified timeframe.

**Parameters:**
- `project_id` (string, required): The ID of the project
- `timeframe` ('week' | 'month' | 'quarter' | 'year', required): Time period
- `start_date` (string, optional): Custom start date (ISO 8601) - overrides timeframe
- `end_date` (string, optional): Custom end date (ISO 8601) - overrides timeframe
- `metric` (enum, optional, default: 'engagement'): Ranking metric
  - `'engagement'` - Total views + opens + clicks (most comprehensive)
  - `'open_rate'` - Email open rate (email performance)
  - `'click_rate'` - Email click rate (engagement depth)
  - `'feedback_count'` - Number of feedback items (customer response)
  - `'feedback_sentiment'` - Average sentiment score (customer satisfaction)
- `limit` (number, optional): Number of results (max 50, default: 10)
- `response_format` ('json' | 'markdown', optional): Output format (default: 'markdown')

**Example:**
```json
{
  "project_id": "proj_123",
  "timeframe": "quarter",
  "metric": "engagement",
  "limit": 5
}
```

**Returns:**
Ranked list of announcements with:
- Announcement details (ID, headline, slug, publish date)
- Primary metric value
- All other available metrics (views, opens, clicks, rates, feedback)

**Use cases:**
- "Which announcements performed best this quarter?"
- "Show me top 5 announcements by email open rate this month"
- "What got the most feedback in the last week?"
- "Which announcements had the best sentiment this year?"

---

## Complete Usage Example

Here's a complete workflow for customizing a LaunchNotes project:

```bash
# 1. List all your projects
# Response: Shows all projects with IDs

# 2. Get details for a specific project
{
  "project_id": "proj_abc123",
  "response_format": "markdown"
}

# 3. Update the color scheme
{
  "project_id": "proj_abc123",
  "primary_color": "#FF5733",
  "secondary_color": "#3498DB"
}

# 4. Add custom CSS to hide elements
{
  "project_id": "proj_abc123",
  "custom_css": ".sidebar { display: none; } .header { background: #FF5733; }"
}

# 5. Update content
{
  "project_id": "proj_abc123",
  "title": "Product Updates",
  "heading": "Stay Updated",
  "subheading": "All the latest features and improvements"
}

# 6. Enable features
{
  "project_id": "proj_abc123",
  "feedback_enabled": true,
  "roadmap_enabled": true
}
```

## API Rate Limits

LaunchNotes enforces a rate limit of **300 operations per 5 minutes**. The server will return an error if this limit is exceeded.

## Error Handling

The server provides detailed error messages for common issues:

- **Authentication failed**: Check your API token
- **Project not found**: Verify the project ID exists
- **Rate limit exceeded**: Wait before making more requests
- **Validation error**: Check that all required fields are provided and formatted correctly

## Development

### Running in Development Mode

```bash
npm run dev
```

This will watch for TypeScript changes and rebuild automatically.

### Project Structure

```
@launchnotes/mcp/
├── src/
│   ├── index.ts              # Server initialization
│   ├── shared/
│   │   ├── client.ts         # GraphQL client
│   │   ├── constants.ts      # API configuration
│   │   └── types.ts          # Shared TypeScript interfaces
│   ├── projects/
│   │   ├── types.ts          # Project types
│   │   ├── queries.ts        # Project GraphQL queries
│   │   ├── schemas.ts        # Project Zod schemas
│   │   ├── formatters.ts     # Project response formatters
│   │   └── tools.ts          # Project tool implementations
│   └── announcements/
│       ├── types.ts          # Announcement types
│       ├── queries.ts        # Announcement GraphQL queries
│       ├── schemas.ts        # Announcement Zod schemas
│       ├── formatters.ts     # Announcement response formatters
│       └── tools.ts          # Announcement tool implementations
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Connecting to Claude Desktop

To use this MCP server with Claude Desktop:

1. **Configure Claude Desktop:**

   Edit your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

   Add the server configuration:
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

   Or if running from source:
   ```json
   {
     "mcpServers": {
       "launchnotes": {
         "command": "node",
         "args": ["/path/to/mcp/dist/index.js"],
         "env": {
           "LAUNCHNOTES_API_TOKEN": "your-token-here"
         }
       }
     }
   }
   ```

2. **Restart Claude Desktop**

3. **Verify the connection:**
   Ask Claude: "List my LaunchNotes projects"

## Troubleshooting

### Server won't start

- Ensure Node.js 18+ is installed: `node --version`
- Verify your API token is set correctly
- Check that the server is built: `npm run build`

### Authentication errors

- Confirm your API token is valid
- Check that you're using a Management token (not Public) for write operations
- Verify the token hasn't expired

### Can't find my project

- Use `launchnotes_list_projects` to see all accessible projects
- Verify you have permission to access the project
- Check that you're using the correct project ID (not the slug)

## Contributing

This is a custom MCP server. To add new tools or features:

1. Add new tool schemas in `src/schemas/`
2. Implement tool logic in `src/tools/`
3. Register tools in the appropriate file
4. Update this README with documentation

## License

MIT

## Support

For LaunchNotes API questions, visit: https://help.launchnotes.com/

For MCP protocol questions, visit: https://modelcontextprotocol.io/
