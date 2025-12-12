/**
 * Announcement Type Definitions
 */

export interface LaunchNotesAnnouncement {
  id: string;
  headline: string;
  title?: string;
  titleWithFallback: string;
  name?: string;
  description?: string;
  content?: string;
  contentHtml?: string;
  excerpt?: string;
  state: "draft" | "scheduled" | "published" | "archived";
  slug: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  publicPermalink?: string;
  privatePermalink?: string;
  categories?: LaunchNotesCategory[];
}

export interface LaunchNotesAnnouncementList {
  id: string;
  headline: string;
  state: string;
  publishedAt?: string;
  scheduledAt?: string;
  slug: string;
  createdAt: string;
}

export interface LaunchNotesCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface CreateAnnouncementInput {
  projectId: string;
  announcement: CreateAnnouncementAttributes;
}

export interface CreateAnnouncementAttributes {
  headline: string;
  content?: string;
  title?: string;
  name?: string;
  description?: string;
  excerpt?: string;
  categoryIds?: string[];
  changeTypeIds?: string[];
  workItemIds?: string[];
}

export interface UpdateAnnouncementInput {
  announcement: UpdateAnnouncementAttributes;
}

export interface UpdateAnnouncementAttributes {
  id: string;
  headline?: string;
  content?: string;
  title?: string;
  name?: string;
  description?: string;
  excerpt?: string;
  categoryIds?: string[];
  changeTypeIds?: string[];
  workItemIds?: string[];
}
