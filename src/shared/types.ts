/**
 * Shared GraphQL Response Types
 */

export interface GraphQLError {
  message: string;
  path?: (string | number)[];
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}
