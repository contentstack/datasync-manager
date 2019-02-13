## Contentstack sync

- Stack version
  - Only v3 stacks are supported
- Scability issues
  - Everytime a new DB is to be synced, Contentstack webhooks needs to be created
- Sync manager hooks/plugins
  - Data modified in the hooks aren't reflected in the data being stored in the DB
  - Workaround here is to - insert the modified data via hooks/plugins
- Security
  1. Data stored in filesystem in plaintext, is vulnerable
    - Workaround here is to - use mongodb + authentications
  2. Tokens are saved in the filesystem in plaintext

### Known bugs
- Old entry schema structure
  - If entry schema/json differs from its content type, there are chances that the 'asset' and 'references' might not work as intended
  - Workaround here is to - save the entry, and re-publish it
- Failed/filtered data
  - Data that failed to get synced are not re-tried i.e. are lost
  - We'd be adding support to avoid this in future release
