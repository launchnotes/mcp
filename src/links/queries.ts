/**
 * External Content Link GraphQL Queries and Operations
 */

import type { GraphQLClient } from "../shared/client.js";
import type { CreateExternalContentLinkResult } from "./types.js";

export const CREATE_EXTERNAL_CONTENT_LINK_MUTATION = `
  mutation CreateExternalContentLink($input: CreateExternalContentLinkInput!) {
    createExternalContentLink(input: $input) {
      errors {
        message
        path
      }
    }
  }
`;

export async function createExternalContentLink(
  client: GraphQLClient,
  ownerId: string,
  title: string,
  url: string,
  toolName?: string
): Promise<CreateExternalContentLinkResult> {
  return client.execute(
    CREATE_EXTERNAL_CONTENT_LINK_MUTATION,
    {
      input: {
        externalContentLink: {
          ownerId,
          title,
          url,
        },
      },
    },
    toolName ? { "X-LN-MCP-Tool": toolName } : undefined
  );
}
