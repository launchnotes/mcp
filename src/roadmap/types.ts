/**
 * Roadmap Type Definitions
 */

export interface LaunchNotesStage {
  id: string;
  name: string;
  position: number;
}

export interface LaunchNotesWorkItem {
  id: string;
  name: string;
  position: number;
  stageId: string;
}

export interface LaunchNotesWorkItemDetailed extends LaunchNotesWorkItem {
  content?: string;
  contentHtml?: string;
  slug?: string;
  state?: string;
  createdAt?: string;
  updatedAt?: string;
  publicPermalink?: string;
  categories?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  owner?: {
    id: string;
    name: string;
  };
}
