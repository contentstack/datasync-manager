export const response = {
  items: [{
    type: 'entry_published',
    event_at: '2019-07-14T14:33:35.187Z',
    content_type_uid: 'sample_fourt',
    data: {
        locale: 'en-us',
        title: 'S4 - Sample One',
        url: '/s4---sample-one',
        reference_single: [
            {
                uid: 'blt42421a4bb082080b',
                _content_type_uid: 'sample_one',
            },
        ],
        reference_multiple: [
            {
                uid: 'bltcb15ca66990835cd',
                _content_type_uid: 'sample_two',
            },
        ],
        group: {
            reference_multiple: [
                {
                    uid: 'blt42421a4bb082080b',
                    _content_type_uid: 'sample_one',
                },
            ],
            reference_single: [
                {
                    uid: 'blt42421a4bb082080b',
                    _content_type_uid: 'sample_one',
                },
            ],
        },
        modular_blocks: [
            {
                block_one: {
                    reference_single: [
                        {
                            uid: 'blt42421a4bb082080b',
                            _content_type_uid: 'sample_one',
                        },
                    ],
                    reference_multiple: [
                        {
                            uid: 'blt2c71a0bc9d5f9cec',
                            _content_type_uid: 'sample_one',
                        },
                    ],
                },
            },
        ],
        tags: [],
        uid: 'blt7313fbef54db1ba4',
        created_by: 'blta8c6c505f1e82dda',
        updated_by: 'blta8c6c505f1e82dda',
        created_at: '2019-07-14T14:32:50.044Z',
        updated_at: '2019-07-14T14:33:32.838Z',
        _version: 2,
        _in_progress: false,
        publish_details: {
            environment: 'blt2e69b1b65d17bc6f',
            locale: 'en-us',
            time: '2019-07-14T14:33:35.187Z',
            user: 'blta8c6c505f1e82dda',
        },
    },
  },
  {
    content_type_uid: 'references',
    event_at: '2019-07-14T14:57:46.108Z',
    type: 'entry_published',
    'data': {
        locale: 'en-us',
        title: 'Reference One',
        url: '/reference-one',
        'group': [
            {
                group: {
                    reference: [
                        'bltbff0f219e90ae349',
                    ],
                },
            },
            {
                group: {
                    reference: [
                        'blt3de1e9bb98de5f65',
                    ],
                },
            },
        ],
        modular_blocks: [
            {
                block_one: {
                    reference: [
                        'blte3a5e860350f0e65',
                        'blt549c25071dddbb0a',
                    ],
                },
            },
            {
                block_two: {
                    group: {
                        reference: [
                            'bltedf4e98498a483ca',
                        ],
                    },
                },
            },
            {
                block_one: {
                    reference: [
                        'blt549c25071dddbb0a',
                    ],
                },
            },
            {
                block_two: {
                    group: {
                        reference: [
                            'bltab3a39812b9878d5',
                        ],
                    },
                },
            },
        ],
        tags: [],
        uid: 'blt73592fe05e8f41dc',
        created_by: 'bltdb73bac837c4b3c3',
        updated_by: 'bltdb73bac837c4b3c3',
        created_at: '2019-06-19T13:25:51.861Z',
        updated_at: '2019-07-14T14:57:39.333Z',
        _version: 3,
        _workflow: {
            uid: 'bltae9208d84ca81921',
            updated_at: '2019-06-19T13:25:51.861Z',
            updated_by: 'bltdb73bac837c4b3c3',
            version: 1,
        },
        _in_progress: false,
        publish_details: {
            environment: 'blt0a2ae80e62c59d0d',
            locale: 'en-us',
            time: '2019-07-14T14:57:45.965Z',
            user: 'bltdb73bac837c4b3c3',
        },
    },
  },
  ],
  limit: 100,
  skip: 0,
  sync_token: 'dummy_references_token',
  total_count: 1,
}
