export const schema = [
  {
    "display_name": "Title",
    "uid": "title",
    "data_type": "text",
    "mandatory": true,
    "unique": true,
    "field_metadata": {
      "_default": true,
      "version": 3
    },
    "multiple": false
  },
  {
    "display_name": "URL",
    "uid": "url",
    "data_type": "text",
    "mandatory": false,
    "field_metadata": {
      "_default": true,
      "version": 3
    },
    "multiple": false,
    "unique": false
  },
  {
    "data_type": "reference",
    "display_name": "Lvl 1 Reference",
    "reference_to": "references",
    "field_metadata": {
      "ref_multiple": false
    },
    "uid": "lvl_1_reference",
    "mandatory": false,
    "multiple": false,
    "unique": false
  },
  {
    "data_type": "file",
    "display_name": "Lvl 1 File",
    "uid": "lvl_1_file",
    "extensions": [],
    "field_metadata": {
      "description": "",
      "rich_text_type": "standard",
      "image": true
    },
    "dimension": {
      "width": {
        "max": null
      },
      "height": {
        "max": null
      }
    },
    "multiple": false,
    "mandatory": false,
    "unique": false
  },
  {
    "data_type": "group",
    "display_name": "Lvl 1 Group One",
    "field_metadata": {},
    "schema": [
      {
        "data_type": "file",
        "display_name": "Lvl 2 File One",
        "uid": "lvl_2_file_one",
        "extensions": [],
        "field_metadata": {
          "description": "",
          "rich_text_type": "standard"
        },
        "multiple": false,
        "mandatory": false,
        "unique": false
      },
      {
        "data_type": "file",
        "display_name": "Lvl 2 File Two",
        "uid": "lvl_2_file_two",
        "extensions": [],
        "field_metadata": {
          "description": "",
          "rich_text_type": "standard"
        },
        "multiple": true,
        "mandatory": false,
        "unique": false
      },
      {
        "data_type": "reference",
        "display_name": "Lvl 2 Reference One",
        "reference_to": "references",
        "field_metadata": {
          "ref_multiple": false
        },
        "uid": "lvl_2_reference_one",
        "mandatory": false,
        "multiple": false,
        "unique": false
      },
      {
        "data_type": "reference",
        "display_name": "Lvl 2 Reference Two",
        "reference_to": "references",
        "field_metadata": {
          "ref_multiple": true
        },
        "uid": "lvl_2_reference_two",
        "mandatory": false,
        "multiple": false,
        "unique": false
      },
      {
        "data_type": "group",
        "display_name": "Lvl 2 Group One",
        "field_metadata": {},
        "schema": [
          {
            "data_type": "file",
            "display_name": "Lvl 3 File One",
            "uid": "lvl_3_file_one",
            "extensions": [],
            "field_metadata": {
              "description": "",
              "rich_text_type": "standard",
              "image": true
            },
            "dimension": {
              "width": {
                "min": null,
                "max": null
              },
              "height": {
                "min": null,
                "max": null
              }
            },
            "multiple": false,
            "mandatory": false,
            "unique": false
          },
          {
            "data_type": "reference",
            "display_name": "Lvl 3 Reference One",
            "reference_to": "references",
            "field_metadata": {
              "ref_multiple": false
            },
            "uid": "lvl_3_reference_one",
            "mandatory": false,
            "multiple": false,
            "unique": false
          }
        ],
        "uid": "lvl_2_group_one",
        "multiple": false,
        "mandatory": false,
        "unique": false
      },
      {
        "data_type": "group",
        "display_name": "Lvl 2 Group Two",
        "field_metadata": {},
        "schema": [
          {
            "data_type": "reference",
            "display_name": "Reference",
            "reference_to": "references",
            "field_metadata": {
              "ref_multiple": false
            },
            "uid": "reference",
            "mandatory": false,
            "multiple": false,
            "unique": false
          },
          {
            "data_type": "file",
            "display_name": "File",
            "uid": "file",
            "extensions": [],
            "field_metadata": {
              "description": "",
              "rich_text_type": "standard",
              "image": true
            },
            "multiple": true,
            "dimension": {
              "width": {
                "min": null,
                "max": null
              },
              "height": {
                "min": null,
                "max": null
              }
            },
            "mandatory": false,
            "unique": false
          }
        ],
        "uid": "lvl_2_group_two",
        "multiple": true,
        "mandatory": false,
        "unique": false
      }
    ],
    "uid": "lvl_1_group_one",
    "multiple": false,
    "mandatory": false,
    "unique": false
  },
  {
    "data_type": "group",
    "display_name": "Lvl 1 Group Two",
    "field_metadata": {},
    "schema": [
      {
        "data_type": "group",
        "display_name": "Lvl 2 Group One",
        "field_metadata": {},
        "schema": [
          {
            "data_type": "file",
            "display_name": "File",
            "uid": "file",
            "extensions": [],
            "field_metadata": {
              "description": "",
              "rich_text_type": "standard"
            },
            "multiple": true,
            "mandatory": false,
            "unique": false
          },
          {
            "data_type": "reference",
            "display_name": "Reference",
            "reference_to": "references",
            "field_metadata": {
              "ref_multiple": true
            },
            "uid": "reference",
            "mandatory": false,
            "multiple": false,
            "unique": false
          }
        ],
        "uid": "lvl_2_group_one",
        "multiple": false,
        "mandatory": false,
        "unique": false
      },
      {
        "data_type": "group",
        "display_name": "Lvl 2 Group Two",
        "field_metadata": {},
        "schema": [
          {
            "data_type": "reference",
            "display_name": "Reference",
            "reference_to": "references",
            "field_metadata": {
              "ref_multiple": false
            },
            "uid": "reference",
            "mandatory": false,
            "multiple": false,
            "unique": false
          },
          {
            "data_type": "file",
            "display_name": "File",
            "uid": "file",
            "extensions": [],
            "field_metadata": {
              "description": "",
              "rich_text_type": "standard"
            },
            "multiple": true,
            "mandatory": false,
            "unique": false
          }
        ],
        "uid": "lvl_2_group_two",
        "multiple": false,
        "mandatory": false,
        "unique": false
      }
    ],
    "uid": "lvl_1_group_two",
    "multiple": true,
    "mandatory": false,
    "unique": false
  },
  {
    "data_type": "blocks",
    "display_name": "Modular Blocks",
    "blocks": [
      {
        "title": "Block One",
        "uid": "block_one",
        "schema": [
          {
            "data_type": "file",
            "display_name": "File",
            "uid": "file",
            "extensions": [],
            "field_metadata": {
              "description": "",
              "rich_text_type": "standard"
            },
            "multiple": false,
            "mandatory": false,
            "unique": false
          },
          {
            "data_type": "reference",
            "display_name": "Reference",
            "reference_to": "references",
            "field_metadata": {
              "ref_multiple": true
            },
            "uid": "reference",
            "mandatory": false,
            "multiple": false,
            "unique": false
          }
        ]
      }
    ],
    "multiple": true,
    "uid": "modular_blocks",
    "field_metadata": {},
    "mandatory": false,
    "unique": false
  }
]