export const contentType = {
  content_type: {
    _version: 1,
    schema: [{
        data_type: 'text',
        display_name: 'Title',
        field_metadata: {
          _default: true,
        },
        mandatory: true,
        multiple: false,
        uid: 'title',
        unique: true,
      },
      {
        data_type: 'text',
        display_name: 'URL',
        field_metadata: {
          _default: true,
        },
        mandatory: true,
        multiple: false,
        uid: 'url',
        unique: true,
      },
    ],
    title: 'Authors',
    uid: 'authors',
  },
}
