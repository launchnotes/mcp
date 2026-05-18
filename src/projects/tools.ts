/**
 * LaunchNotes Project Tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GraphQLClient } from "../shared/client.js";
import { RESPONSE_FORMAT } from "../shared/constants.js";
import { getProject, listProjects, updateProject } from "./queries.js";
import { formatProjectMarkdown, formatProjectListMarkdown } from "./formatters.js";
import {
  GetProjectSchema,
  ListProjectsSchema,
  UpdateProjectCustomCodeSchema,
  UpdateProjectColorsSchema,
  UpdateProjectContentSchema,
  UpdateProjectFeaturesSchema,
  type GetProjectInput,
  type ListProjectsInput,
  type UpdateProjectCustomCodeInput,
  type UpdateProjectColorsInput,
  type UpdateProjectContentInput,
  type UpdateProjectFeaturesInput,
} from "./schemas.js";

/**
 * Register all project tools
 */
export function registerProjectTools(server: McpServer, client: GraphQLClient): void {
  // Tool 1: Get Project
  server.registerTool(
    "launchnotes_get_project",
    {
      title: "Get LaunchNotes Project",
      description: `Retrieve complete details for a LaunchNotes project, including all customization settings, colors, custom code, and feature flags.

Args:
  - project_id (string): The ID of the project to retrieve
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  For JSON format: Complete project object with all fields
  For Markdown format: Formatted project details with sections for colors, custom code, and features

Use Cases:
  - "Show me my project's current custom CSS"
  - "What are the color values for project X?"
  - "Get all settings for my LaunchNotes project"

Error Handling:
  - Returns "Project not found" if the project ID doesn't exist
  - Returns "Authentication failed" if the API token is invalid`,
      inputSchema: GetProjectSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetProjectInput) => {
      try {
        const result = await getProject(client, params.project_id, "launchnotes_get_project");
        const project = result.project;

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(project, null, 2),
              },
            ],
          };
        }

        // Markdown format
        return {
          content: [
            {
              type: "text",
              text: formatProjectMarkdown(project),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error retrieving project: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 2: List Projects
  server.registerTool(
    "launchnotes_list_projects",
    {
      title: "List LaunchNotes Projects",
      description: `List all LaunchNotes projects accessible with the current API token.

Args:
  - response_format ('json' | 'markdown'): Output format (default: 'markdown')

Returns:
  List of projects with id, name, slug, and public URL

Use Cases:
  - "Show me all my LaunchNotes projects"
  - "List projects in my organization"
  - "What projects do I have access to?"

Error Handling:
  - Returns "Authentication failed" if the API token is invalid`,
      inputSchema: ListProjectsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListProjectsInput) => {
      try {
        const result = await listProjects(client, "launchnotes_list_projects");
        const projects = result.viewer.projects.nodes;

        if (params.response_format === RESPONSE_FORMAT.JSON) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    total: projects.length,
                    projects,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // Markdown format
        return {
          content: [
            {
              type: "text",
              text: formatProjectListMarkdown(projects),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error listing projects: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 3: Update Project Custom Code
  server.registerTool(
    "launchnotes_update_project_custom_code",
    {
      title: "Update LaunchNotes Project Custom Code",
      description: `Update custom CSS, HTML head, header, footer, or index hero for a LaunchNotes project.

Args:
  - project_id (string): The ID of the project to update
  - custom_css (string, optional): Custom CSS code
  - custom_head (string, optional): Custom HTML for <head> section
  - custom_header (string, optional): Custom HTML for page header
  - custom_footer (string, optional): Custom HTML for page footer
  - custom_index_hero (string, optional): Custom HTML for index hero section

At least one custom code field must be provided. Fields not provided will remain unchanged.

Returns:
  Confirmation message with project ID and updated timestamp

Use Cases:
  - "Add custom CSS to hide the sidebar"
  - "Update the custom header HTML"
  - "Set custom analytics code in the head"
  - "Add a custom footer with social links"

Error Handling:
  - Returns validation errors if no fields are provided
  - Returns "Project not found" if the project ID doesn't exist
  - Returns "Authentication failed" if the API token lacks permission`,
      inputSchema: UpdateProjectCustomCodeSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: UpdateProjectCustomCodeInput) => {
      try {
        const attributes: Record<string, string> = {};
        
        if (params.custom_css !== undefined) attributes.customCss = params.custom_css;
        if (params.custom_head !== undefined) attributes.customHead = params.custom_head;
        if (params.custom_header !== undefined) attributes.customHeader = params.custom_header;
        if (params.custom_footer !== undefined) attributes.customFooter = params.custom_footer;
        if (params.custom_index_hero !== undefined) attributes.customIndexHero = params.custom_index_hero;

        const result = await updateProject(client, params.project_id, attributes, "launchnotes_update_project_custom_code");

        if (result.updateProject.errors && result.updateProject.errors.length > 0) {
          const errorMessages = result.updateProject.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const updatedFields = Object.keys(attributes).map(k => 
          k.replace(/([A-Z])/g, " $1").toLowerCase()
        ).join(", ");

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully updated custom code for project ${params.project_id}\n\nUpdated fields: ${updatedFields}\n\nLast updated: ${result.updateProject.project?.updatedAt}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error updating project custom code: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 4: Update Project Colors
  server.registerTool(
    "launchnotes_update_project_colors",
    {
      title: "Update LaunchNotes Project Colors",
      description: `Update color palette and theme for a LaunchNotes project. All colors must be in hex format (e.g., #FF5733).

Args:
  - project_id (string): The ID of the project to update
  - primary_color (string, optional): Primary brand color (hex)
  - secondary_color (string, optional): Secondary brand color (hex)
  - primary_text_color (string, optional): Primary text color (hex)
  - secondary_text_color (string, optional): Secondary text color (hex)
  - gray_color (string, optional): Gray accent color (hex)
  - light_gray_color (string, optional): Light gray color (hex)
  - off_white_color (string, optional): Off-white color (hex)
  - white_color (string, optional): White color (hex)
  - supporting_palette (string, optional): Supporting palette configuration
  - color_theme (string, optional): Overall color theme identifier

At least one color field must be provided. Fields not provided will remain unchanged.

Returns:
  Confirmation message with updated color fields

Use Cases:
  - "Change the primary color to #FF5733"
  - "Update all brand colors for my project"
  - "Set text colors to improve readability"
  - "Update the color theme to dark mode"

Error Handling:
  - Returns validation error if hex colors are invalid
  - Returns "Project not found" if the project ID doesn't exist`,
      inputSchema: UpdateProjectColorsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: UpdateProjectColorsInput) => {
      try {
        const attributes: Record<string, string> = {};
        
        if (params.primary_color !== undefined) attributes.primaryColor = params.primary_color;
        if (params.secondary_color !== undefined) attributes.secondaryColor = params.secondary_color;
        if (params.gray_color !== undefined) attributes.grayColor = params.gray_color;
        if (params.light_gray_color !== undefined) attributes.lightGrayColor = params.light_gray_color;
        if (params.off_white_color !== undefined) attributes.offWhiteColor = params.off_white_color;
        if (params.white_color !== undefined) attributes.whiteColor = params.white_color;
        if (params.primary_text_color !== undefined) attributes.primaryTextColor = params.primary_text_color;
        if (params.secondary_text_color !== undefined) attributes.secondaryTextColor = params.secondary_text_color;
        if (params.supporting_palette !== undefined) attributes.supportingPalette = params.supporting_palette;
        if (params.color_theme !== undefined) attributes.colorTheme = params.color_theme;

        const result = await updateProject(client, params.project_id, attributes, "launchnotes_update_project_colors");

        if (result.updateProject.errors && result.updateProject.errors.length > 0) {
          const errorMessages = result.updateProject.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const updatedFields = Object.keys(attributes).map(k => 
          k.replace(/([A-Z])/g, " $1").toLowerCase()
        ).join(", ");

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully updated colors for project ${params.project_id}\n\nUpdated fields: ${updatedFields}\n\nLast updated: ${result.updateProject.project?.updatedAt}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error updating project colors: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 5: Update Project Content
  server.registerTool(
    "launchnotes_update_project_content",
    {
      title: "Update LaunchNotes Project Content",
      description: `Update project title, description, headings, and slug for a LaunchNotes project.

Args:
  - project_id (string): The ID of the project to update
  - name (string, optional): Internal project name
  - title (string, optional): Public-facing project title
  - description (string, optional): Project description
  - heading (string, optional): Main heading on the project page
  - subheading (string, optional): Subheading below the main heading
  - slug (string, optional): URL-friendly identifier (lowercase, hyphens only)

At least one content field must be provided. Fields not provided will remain unchanged.

Returns:
  Confirmation message with updated content fields

Use Cases:
  - "Update project title to 'Product Updates'"
  - "Change the heading and subheading"
  - "Update the project slug to 'updates'"
  - "Set a new description"

Error Handling:
  - Returns validation error if slug format is invalid
  - Returns "Project not found" if the project ID doesn't exist`,
      inputSchema: UpdateProjectContentSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: UpdateProjectContentInput) => {
      try {
        const attributes: Record<string, string> = {};
        
        if (params.name !== undefined) attributes.name = params.name;
        if (params.title !== undefined) attributes.title = params.title;
        if (params.description !== undefined) attributes.description = params.description;
        if (params.heading !== undefined) attributes.heading = params.heading;
        if (params.subheading !== undefined) attributes.subheading = params.subheading;
        if (params.slug !== undefined) attributes.slug = params.slug;

        const result = await updateProject(client, params.project_id, attributes, "launchnotes_update_project_content");

        if (result.updateProject.errors && result.updateProject.errors.length > 0) {
          const errorMessages = result.updateProject.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const updatedFields = Object.keys(attributes).join(", ");

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully updated content for project ${params.project_id}\n\nUpdated fields: ${updatedFields}\n\nLast updated: ${result.updateProject.project?.updatedAt}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error updating project content: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 6: Update Project Features
  server.registerTool(
    "launchnotes_update_project_features",
    {
      title: "Update LaunchNotes Project Features",
      description: `Enable or disable features for a LaunchNotes project (feedback, roadmap, ideas, RSS, voting, SEO indexing).

Args:
  - project_id (string): The ID of the project to update
  - feedback_enabled (boolean, optional): Enable/disable feedback collection
  - roadmap_enabled (boolean, optional): Enable/disable roadmap feature
  - ideas_enabled (boolean, optional): Enable/disable ideas/feature requests
  - rss_feed_enabled (boolean, optional): Enable/disable RSS feed
  - voting_enabled (boolean, optional): Enable/disable voting on ideas
  - noindex (boolean, optional): Prevent search engine indexing (true = disabled SEO)

At least one feature toggle must be provided. Features not specified will remain unchanged.

Returns:
  Confirmation message with updated feature toggles

Use Cases:
  - "Enable feedback collection for my project"
  - "Turn on the roadmap feature"
  - "Disable RSS feed"
  - "Enable voting on ideas"

Error Handling:
  - Returns "Project not found" if the project ID doesn't exist`,
      inputSchema: UpdateProjectFeaturesSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: UpdateProjectFeaturesInput) => {
      try {
        const attributes: Record<string, boolean> = {};
        
        if (params.feedback_enabled !== undefined) attributes.feedbackEnabled = params.feedback_enabled;
        if (params.roadmap_enabled !== undefined) attributes.roadmapEnabled = params.roadmap_enabled;
        if (params.ideas_enabled !== undefined) attributes.ideasEnabled = params.ideas_enabled;
        if (params.rss_feed_enabled !== undefined) attributes.rssFeedEnabled = params.rss_feed_enabled;
        if (params.voting_enabled !== undefined) attributes.votingEnabled = params.voting_enabled;
        if (params.noindex !== undefined) attributes.noindex = params.noindex;

        const result = await updateProject(client, params.project_id, attributes, "launchnotes_update_project_features");

        if (result.updateProject.errors && result.updateProject.errors.length > 0) {
          const errorMessages = result.updateProject.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        const updatedFeatures = Object.entries(attributes).map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, " $1").toLowerCase();
          return `${label}: ${value ? "enabled" : "disabled"}`;
        }).join("\n  - ");

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully updated features for project ${params.project_id}\n\nUpdated features:\n  - ${updatedFeatures}\n\nLast updated: ${result.updateProject.project?.updatedAt}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error updating project features: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
