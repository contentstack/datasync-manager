export const contentType = {
  content_type: {
    'title': 'Markdown',
    'uid': 'markdown',
    '_version': 2,
    'schema': [{
        'display_name': 'Title',
        'uid': 'title',
        'data_type': 'text',
        'mandatory': true,
        'unique': true,
        'field_metadata': {
          '_default': true,
          'version': 3
        },
        'multiple': false
      },
      {
        'display_name': 'URL',
        'uid': 'url',
        'data_type': 'text',
        'mandatory': false,
        'field_metadata': {
          '_default': true,
          'version': 3
        },
        'multiple': false,
        'unique': false
      },
      {
        'data_type': 'text',
        'display_name': 'Markdown',
        'uid': 'markdown',
        'field_metadata': {
          'description': '',
          'markdown': true,
          'version': 3
        },
        'multiple': false,
        'mandatory': false,
        'unique': false
      }
    ],
  }
}
