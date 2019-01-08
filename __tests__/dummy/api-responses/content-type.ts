export const contentType = {
  content_type: {
    _version: 1,
    schema: [{
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        field_metadata: {
          _default: true
        },
        unique: true,
        mandatory: true,
        multiple: false,
      },
      {
        display_name: 'URL',
        uid: 'url',
        data_type: 'text',
        field_metadata: {
          _default: true,
        },
        unique: false,
        mandatory: false,
        multiple: false,
      },
    ],
    title: 'Authors',
    uid: 'authors',
  },
}
