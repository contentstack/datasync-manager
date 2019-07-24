export const contentType = {
  content_type: {
    created_at: '2019-07-12T17:34:15.060Z',
    updated_at: '2019-07-14T14:18:53.278Z',
    // tslint:disable-next-line: object-literal-sort-keys
    title: 'Sample Three',
    uid: 'sample_three',
    _version: 3,
    inbuilt_class: false,
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        // tslint:disable-next-line: object-literal-sort-keys
        data_type: 'text',
        mandatory: true,
        unique: true,
        field_metadata: {
          _default: true,
          version: 3,
        },
        non_localizable: false,
        multiple: false,
      },
      {
        display_name: 'URL',
        uid: 'url',
        // tslint:disable-next-line: object-literal-sort-keys
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          _default: true,
          version: 3,
        },
        non_localizable: false,
        multiple: false,
        unique: false,
      },
      {
        data_type: 'file',
        display_name: 'File',
        uid: 'file',
        // tslint:disable-next-line: object-literal-sort-keys
        extensions: [],
        field_metadata: {
          description: '',
          rich_text_type: 'standard',
        },
        reference_to: [],
        non_localizable: false,
        multiple: false,
        mandatory: false,
        unique: false,
      },
      {
        data_type: 'text',
        display_name: 'Rich text editor',
        uid: 'rich_text_editor',
        // tslint:disable-next-line: object-literal-sort-keys
        field_metadata: {
          allow_rich_text: true,
          description: '',
          multiline: false,
          rich_text_type: 'advanced',
          // tslint:disable-next-line: object-literal-sort-keys
          options: [],
          version: 3,
        },
        reference_to: [],
        non_localizable: false,
        multiple: false,
        mandatory: false,
        unique: false,
      },
      {
        data_type: 'group',
        display_name: 'Group',
        field_metadata: {},
        schema: [
          {
            data_type: 'text',
            display_name: 'Rich text editor',
            uid: 'rich_text_editor',
            // tslint:disable-next-line: object-literal-sort-keys
            field_metadata: {
              allow_rich_text: true,
              description: '',
              multiline: false,
              rich_text_type: 'advanced',
              // tslint:disable-next-line: object-literal-sort-keys
              options: [],
              version: 3,
            },
            reference_to: [],
            non_localizable: false,
            multiple: false,
            mandatory: false,
            unique: false,
          },
        ],
        uid: 'group',
        // tslint:disable-next-line: object-literal-sort-keys
        reference_to: [],
        multiple: true,
        non_localizable: false,
        mandatory: false,
        unique: false,
      },
      {
        data_type: 'blocks',
        display_name: 'Modular Blocks',
        // tslint:disable-next-line: object-literal-sort-keys
        blocks: [
          {
            title: 'Block One',
            uid: 'block_one',
            // tslint:disable-next-line: object-literal-sort-keys
            schema: [
              {
                data_type: 'text',
                display_name: 'Markdown',
                uid: 'markdown',
                // tslint:disable-next-line: object-literal-sort-keys
                field_metadata: {
                  description: '',
                  markdown: true,
                  version: 3,
                },
                reference_to: [],
                multiple: true,
                non_localizable: false,
                mandatory: false,
                unique: false,
              },
              {
                data_type: 'text',
                display_name: 'Rich text editor',
                uid: 'rich_text_editor',
                // tslint:disable-next-line: object-literal-sort-keys
                field_metadata: {
                  allow_rich_text: true,
                  description: '',
                  multiline: false,
                  rich_text_type: 'advanced',
                  // tslint:disable-next-line: object-literal-sort-keys
                  options: [],
                  version: 3,
                },
                reference_to: [],
                multiple: true,
                non_localizable: false,
                mandatory: false,
                unique: false,
              },
            ],
          },
        ],
        multiple: true,
        uid: 'modular_blocks',
        field_metadata: {},
        reference_to: [],
        non_localizable: false,
        mandatory: false,
        unique: false,
      },
    ],
    last_activity: {
      environments: [
        {
          uid: 'blt2e69b1b65d17bc6f',
          // tslint:disable-next-line: object-literal-sort-keys
          details: [
            {
              locale: 'en-us',
              time: '2019-07-14T14:19:45.218Z',
            },
          ],
        },
      ],
    },
    maintain_revisions: true,
    description: 'Haz RTE and Assets',
    options: {
      is_page: true,
      singleton: false,
      title: 'title',
      // tslint:disable-next-line: object-literal-sort-keys
      sub_title: [],
      url_pattern: '/:title',
      url_prefix: '/',
    },
    abilities: {
      get_one_object: true,
      // tslint:disable-next-line: object-literal-sort-keys
      get_all_objects: true,
      create_object: true,
      update_object: true,
      delete_object: true,
      delete_all_objects: true,
    },
  },
}
