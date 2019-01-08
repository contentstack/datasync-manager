/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

/**
 * Default application's internal config
 */
export const config = {
  'contentstack': {
    MAX_RETRY_LIMIT: 8,
    actions: {
      delete: 'delete',
      publish: 'publish',
      unpublish: 'unpublish',
    },
    cdn: 'https://cdn.contentstack.io/v3',
    host: 'https://api.contentstack.io/v3',
    methods: {
      delete: 'DELETE',
      get: 'GET',
      patch: 'PATCH',
      post: 'POST',
    },
    restAPIS: {
      assets: '/assets/',
      contentTypes: '/content_types/',
      entries: '/entries/',
      sync: '/stacks/sync',
    },
  },
  'sync-manager': {
    cooloff: 3000,
    limit: 100,
  },
}
