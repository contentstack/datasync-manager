export const contentType = {
  content_type: {
    created_at: '2019-07-14T14:30:52.314Z',
    updated_at: '2019-07-14T14:32:29.863Z',
    'title': 'Sample Fourt',
    uid: 'sample_fourt',
    _version: 2,
    inbuilt_class: false,
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        'data_type': 'text',
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
        'data_type': 'text',
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
        data_type: 'reference',
        display_name: 'Reference Single',
        reference_to: [
          'sample_one',
        ],
        'field_metadata': {
          ref_multiple: false,
          ref_multiple_content_types: true,
        },
        uid: 'reference_single',
        non_localizable: false,
        multiple: false,
        mandatory: false,
        unique: false,
      },
      {
        data_type: 'reference',
        display_name: 'Reference Multiple',
        reference_to: [
          'sample_one',
          'sample_two',
        ],
        'field_metadata': {
          ref_multiple: false,
          ref_multiple_content_types: true,
        },
        uid: 'reference_multiple',
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
            data_type: 'reference',
            display_name: 'Reference Multiple',
            reference_to: [
              'sample_one',
              'sample_three',
            ],
            'field_metadata': {
              ref_multiple: false,
              ref_multiple_content_types: true,
            },
            uid: 'reference_multiple',
            non_localizable: false,
            multiple: false,
            mandatory: false,
            unique: false,
          },
          {
            data_type: 'reference',
            display_name: 'Reference Single',
            reference_to: [
              'sample_one',
            ],
            'field_metadata': {
              ref_multiple: false,
              ref_multiple_content_types: true,
            },
            uid: 'reference_single',
            non_localizable: false,
            multiple: false,
            mandatory: false,
            unique: false,
          },
        ],
        uid: 'group',
        'reference_to': [],
        non_localizable: false,
        multiple: false,
        mandatory: false,
        unique: false,
      },
      {
        data_type: 'blocks',
        display_name: 'Modular Blocks',
        'blocks': [
          {
            title: 'Block One',
            uid: 'block_one',
            'schema': [
              {
                data_type: 'reference',
                display_name: 'Reference Single',
                reference_to: [
                  'sample_one',
                ],
                'field_metadata': {
                  ref_multiple: false,
                  ref_multiple_content_types: true,
                },
                uid: 'reference_single',
                non_localizable: false,
                multiple: false,
                mandatory: false,
                unique: false,
              },
              {
                data_type: 'reference',
                display_name: 'Reference Multiple',
                reference_to: [
                  'sample_one',
                  'sample_two',
                ],
                'field_metadata': {
                  ref_multiple: false,
                  ref_multiple_content_types: true,
                },
                uid: 'reference_multiple',
                non_localizable: false,
                multiple: false,
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
          'details': [
            {
              locale: 'en-us',
              time: '2019-07-14T14:33:35.187Z',
            },
          ],
        },
      ],
    },
    maintain_revisions: true,
    description: 'Haz References',
    options: {
      is_page: true,
      singleton: false,
      title: 'title',
      'sub_title': [],
      url_pattern: '/:title',
      url_prefix: '/',
    },
    abilities: {
      get_one_object: true,
      'get_all_objects': true,
      create_object: true,
      update_object: true,
      delete_object: true,
      delete_all_objects: true,
    },
    DEFAULT_ACL: [
      {
        k: 'others',
        v: {
          read: false,
          'create': false,
        },
      },
      {
        k: 'users.blt83a493c2e276f77a',
        v: {
          read: true,
          sub_acl: {
            read: true,
          },
        },
      },
    ],
    SYS_ACL: {
      roles: [
        {
          uid: 'bltabf7b9b9557df492',
          'read': true,
          sub_acl: {
            create: true,
            read: true,
            update: true,
            'delete': true,
            publish: true,
          },
          update: true,
          delete: true,
        },
        {
          uid: 'blt19284ddfe4579bc2',
          'read': true,
          sub_acl: {
            create: true,
            read: true,
            update: true,
            'delete': true,
            publish: true,
          },
          update: true,
          delete: true,
        },
        {
          uid: 'blt08e644cc4590cfad',
          'read': true,
          sub_acl: {
            create: true,
            read: true,
            update: true,
            'delete': true,
            publish: true,
          },
        },
      ],
      'others': {
        read: false,
        'create': false,
        update: false,
        delete: false,
        sub_acl: {
          read: false,
          'create': false,
          update: false,
          delete: false,
          publish: false,
        },
      },
    },
  },
}
