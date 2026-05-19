/**
 * External Content Link Type Definitions
 */

export interface CreateExternalContentLinkResult {
  createExternalContentLink: {
    errors: Array<{
      message: string;
      path?: string[];
    }>;
  };
}
