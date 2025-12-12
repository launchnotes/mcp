/**
 * Generic GraphQL Client
 */

import axios, { AxiosError } from "axios";
import { API_URL } from "./constants.js";
import type { GraphQLResponse, GraphQLError } from "./types.js";

export class GraphQLClient {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  /**
   * Execute a GraphQL query or mutation
   */
  async execute<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    try {
      const response = await axios.post<GraphQLResponse<T>>(
        API_URL,
        {
          query,
          variables,
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiToken}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      // Check for GraphQL errors
      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessages = response.data.errors
          .map((err: GraphQLError) => err.message)
          .join(", ");
        throw new Error(`GraphQL error: ${errorMessages}`);
      }

      if (!response.data.data) {
        throw new Error("No data returned from GraphQL query");
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          throw new Error("Authentication failed. Please check your API token.");
        }
        if (axiosError.response?.status === 429) {
          throw new Error(
            "Rate limit exceeded. LaunchNotes allows 300 operations per 5 minutes."
          );
        }
        if (axiosError.code === "ECONNABORTED") {
          throw new Error("Request timeout. Please try again.");
        }
        throw new Error(
          `API request failed: ${axiosError.message}`
        );
      }
      throw error;
    }
  }
}

/**
 * Create a GraphQL client instance
 */
export function createClient(apiToken: string): GraphQLClient {
  if (!apiToken || apiToken.trim() === "") {
    throw new Error("LaunchNotes API token is required");
  }
  return new GraphQLClient(apiToken);
}
