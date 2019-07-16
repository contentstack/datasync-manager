export const contentType = {
  content_type: {
    created_at: '2019-06-19T13:23:43.794Z',
    updated_at: '2019-07-14T14:56:59.823Z',
    'title': 'References',
    uid: 'references',
    _version: 4,
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
        data_type: 'group',
        display_name: 'Group',
        field_metadata: {},
        schema: [
          {
            data_type: 'group',
            display_name: 'Group',
            field_metadata: {},
            schema: [
              {
                data_type: 'reference',
                display_name: 'Reference',
                reference_to: 'a',
                'field_metadata': {
                  ref_multiple: true,
                },
                uid: 'reference',
                non_localizable: false,
                multiple: false,
                mandatory: false,
                unique: false,
              },
            ],
            uid: 'group',
            'non_localizable': false,
            multiple: false,
            mandatory: false,
            unique: false,
          },
        ],
        uid: 'group',
        'multiple': true,
        non_localizable: false,
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
                display_name: 'Reference',
                reference_to: 'authors',
                'field_metadata': {
                  ref_multiple: true,
                },
                uid: 'reference',
                non_localizable: false,
                multiple: false,
                mandatory: false,
                unique: false,
              },
            ],
          },
          {
            title: 'Block Two',
            uid: 'block_two',
            'schema': [
              {
                data_type: 'group',
                display_name: 'Group',
                field_metadata: {},
                schema: [
                  {
                    data_type: 'reference',
                    display_name: 'Reference',
                    reference_to: 'books',
                    'field_metadata': {
                      ref_multiple: true,
                    },
                    uid: 'reference',
                    non_localizable: false,
                    multiple: false,
                    mandatory: false,
                    unique: false,
                  },
                ],
                uid: 'group',
                'non_localizable': false,
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
        non_localizable: false,
        mandatory: false,
        unique: false,
      },
    ],
    last_activity: {
      environments: [
        {
          uid: 'blt0a2ae80e62c59d0d',
          'details': [
            {
              locale: 'en-us',
              time: '2019-06-19T13:26:51.443Z',
            },
          ],
        },
      ],
    },
    maintain_revisions: true,
    description: 'References nested deep inside groups & MB',
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
        k: 'users.blt16d9252be0fbeb06',
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
          uid: 'blt57a0a63cf5ebcf26',
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
          uid: 'bltfb8a58e04c696320',
          'read': true,
          sub_acl: {
            create: true,
            read: true,
            update: true,
            'delete': true,
            publish: true,
          },
        },
        {
          uid: 'blte627140a1cff3c86',
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
