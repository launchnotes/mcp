/**
 * Mock Factory - Creates mock data for tests
 */

export const MockFactory = {
  announcement(overrides: Partial<any> = {}) {
    return {
      id: 'ann_mock123',
      headline: 'Test Announcement',
      slug: 'test-announcement',
      state: 'draft',
      publishedAt: null,
      scheduledAt: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      ...overrides,
    };
  },

  project(overrides: Partial<any> = {}) {
    return {
      id: 'pro_mock123',
      name: 'Test Project',
      slug: 'test-project',
      publicUrl: 'https://test.launchnotes.io',
      title: 'Test Project',
      description: 'Test description',
      primaryColor: '#FF5733',
      secondaryColor: '#33FF57',
      ...overrides,
    };
  },

  feedback(overrides: Partial<any> = {}) {
    return {
      id: 'fb_mock123',
      content: 'Test feedback content',
      reaction: 'happy',
      importance: 'high',
      starred: false,
      archived: false,
      affectedCustomer: {
        email: 'test@example.com',
        initials: 'TE',
      },
      createdAt: '2025-01-01T00:00:00Z',
      ...overrides,
    };
  },

  announcementAnalytics(overrides: Partial<any> = {}) {
    return {
      id: 'ann_analytics_123',
      headline: 'Test Analytics Announcement',
      slug: 'test-analytics',
      publishedAt: '2025-01-01T00:00:00Z',
      viewerAnalytics: {
        totalUniqueAnonymousCount: 10,
        totalUniqueEmbeddedCount: 5,
        totalUniqueSubscribersCount: 15,
      },
      emailAnalytics: {
        sentCount: 100,
        openRate: 0.5,
        clickRate: 0.25,
      },
      feedbackHappyCount: 10,
      feedbackMehCount: 2,
      feedbackSadCount: 1,
      ...overrides,
    };
  },

  mutationResponse(mutationName: string, resourceName: string, data: any, errors: any[] = []) {
    return {
      [mutationName]: {
        [resourceName]: data,
        errors,
      },
    };
  },

  queryResponse(queryName: string, data: any) {
    return {
      [queryName]: data,
    };
  },

  pageInfo(overrides: Partial<any> = {}) {
    return {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
      ...overrides,
    };
  },
};
