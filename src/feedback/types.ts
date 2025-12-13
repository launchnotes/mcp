/**
 * Feedback Type Definitions
 */

export interface LaunchNotesFeedback {
  id: string;
  content: string;
  notes?: string;
  reaction: "happy" | "meh" | "sad" | null;
  importance: "low" | "medium" | "high" | null;
  starred: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  affectedCustomer: {
    id: string;
    email: string;
    initials?: string;
    confirmedAt?: string;
  };
  reporter?: {
    id: string;
    email: string;
  };
  feedbackable?: {
    id: string;
    __typename: string;
    name?: string;
  };
}

export interface LaunchNotesFeedbackListItem {
  id: string;
  content: string;
  reaction: "happy" | "meh" | "sad" | null;
  importance: "low" | "medium" | "high" | null;
  starred: boolean;
  archived: boolean;
  createdAt: string;
  affectedCustomer: {
    id: string;
    email: string;
    initials?: string;
  };
  reporter?: {
    id: string;
    email: string;
  };
}

export interface SearchFeedbackFilters {
  query?: string;
  projectId: string;
  reaction?: "happy" | "meh" | "sad";
  importance?: "low" | "medium" | "high";
  organizedState?: string;
  starred?: boolean;
  archived?: boolean;
  first?: number;
  after?: string;
}
