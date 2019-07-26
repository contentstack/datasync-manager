export const config = {
  contentstack: {
    apiKey: 'dummyApiKey',
    deliveryToken: 'dummyDeliveryToken',
    host: 'api.localhost.io',
    sync_token: 'dummySyncToken',
  },
  plugins: [
    {
      disabled: false,
      name: '_cs_internal_transform_entries',
      // path: '',
      options: {
        // other overrides...
      },
    },
    {
      disabled: false,
      name: '_cs_internal_transform_schemas',
      options: {
        logAssetPaths: true,
        logReferencePaths: true,
        // other overrides...
      },
    },
    {
      disabled: false,
      name: '_cs_internal_save_rte_markdown_assets',
      options: {
        // other overrides...
      },
    },
  ],
}
