/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

/**
 * @description Default application's internal config
 */
export const config = {
  assetStore: {},
  contentStore: {
    unwanted: {
      asset: {
        _in_progress: true,
        _type: true,
        content_type_uid: true,
        data: true,
        publish_details: true,
      },
      contentType: {
        content_type_uid: true,
      },
      entry: {
        _content_type: true,
        _in_progress: true,
        _type: true,
        content_type_uid: true,
        data: true,
        publish_details: true,
      },
    },
  },
  contentstack: {
    MAX_RETRY_LIMIT: 6,
    actions: {
      delete: 'delete',
      publish: 'publish',
      unpublish: 'unpublish',
    },
    apis: {
      content_types: '/v3/content_types/',
      sync: '/v3/stacks/sync',
    },
    host: 'cdn.contentstack.io',
    options: 'ig',
    port: 443,
    protocol: 'https:',
    regexp: {
      asset_pattern: {
        options: 'ig',
        url: 'https://(assets|images).contentstack.io/v3/assets/(.*?)/(.*?)/(.*?)/(.*)',
      },
      rte_asset_pattern_1: {
        options: 'ig',
        url: 'https://(assets|images).contentstack.io/v3/assets/(.*?)/(.*?)/(.*?)/(.*?)(?=")',
      },
      rte_asset_pattern_2: {
        options: 'g',
        url: 'https://(assets|images).contentstack.io/v3/assets/(.*?)/(.*?)/(.*?)/(.*?)(.*)',
      },
    },
    query: {
      include_snippet_schema: true,
    },
    verbs: {
      get: 'GET',
    },
  },
  listener: {},
  locales: [],
  plugins: [
    {
      disabled: true,
      name: '_cs_internal_transform_entries',
      // path: '',
      options: {
        // other overrides...
      },
    },
    {
      disabled: true,
      name: '_cs_internal_transform_schemas',
      options: {
        logAssetPaths: true,
        logReferencePaths: true,
        // other overrides...
      },
    },
    {
      disabled: true,
      name: '_cs_internal_save_rte_markdown_assets',
      options: {
        // other overrides...
      },
    },
  ],
  syncManager: {
    cooloff: 3000,
    inet: {
      dns: '8.8.8.8',
      host: 'contentstack.io',
      // DNS port
      port: 53,
      retries: 5,
      retryIncrement: 5 * 1000,
      retryTimeout: 90 * 1000,
      timeout: 30 * 1000,
      type: 'A',
    },
    limit: 100,
    markdown: {
      breaks: true,
      gfm: true,
      smartLists: true,
      tables: true,
      xhtml: false,
    },
    // max file sizes in bytes
    maxsize: 2097152,
    // waits for 10s if the app runs into errors or a kill signal is sent
    processTimeout: 10 * 1000,
    queue: {
      pause_threshold: 7000,
      resume_threshold: 4000,
    },
    saveFailedItems: true,
    saveFilteredItems: true,
  },
}
