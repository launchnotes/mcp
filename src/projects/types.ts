/**
 * Project Type Definitions
 */

export interface LaunchNotesProject {
  id: string;
  name: string;
  title: string;
  slug: string;
  description?: string;
  heading?: string;
  subheading?: string;

  // Custom code
  customCss?: string;
  customHead?: string;
  customHeader?: string;
  customFooter?: string;
  customIndexHero?: string;

  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  grayColor?: string;
  lightGrayColor?: string;
  offWhiteColor?: string;
  whiteColor?: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
  supportingPalette?: string;
  colorTheme?: string;

  // Features
  feedbackEnabled: boolean;
  roadmapEnabled: boolean;
  ideasEnabled: boolean;
  rssFeedEnabled: boolean;
  votingEnabled: boolean;
  noindex: boolean;

  // URLs
  publicPageUrl: string;
  rssFeedUrl?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface LaunchNotesProjectList {
  id: string;
  name: string;
  slug: string;
  publicPageUrl: string;
}

export interface UpdateProjectInput {
  id: string;
  project: UpdateProjectAttributes;
}

export interface UpdateProjectAttributes {
  // Custom code
  customCss?: string;
  customHead?: string;
  customHeader?: string;
  customFooter?: string;
  customIndexHero?: string;

  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  grayColor?: string;
  lightGrayColor?: string;
  offWhiteColor?: string;
  whiteColor?: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
  supportingPalette?: string;
  colorTheme?: string;

  // Content
  name?: string;
  title?: string;
  description?: string;
  heading?: string;
  subheading?: string;
  slug?: string;

  // Features
  feedbackEnabled?: boolean;
  roadmapEnabled?: boolean;
  ideasEnabled?: boolean;
  rssFeedEnabled?: boolean;
  votingEnabled?: boolean;
  noindex?: boolean;
}
