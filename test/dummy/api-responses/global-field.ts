export const response = {
	 "content_type": {
        "created_at": "2019-09-06T12:48:55.523Z",
        "updated_at": "2019-09-10T05:40:56.137Z",
        "title": "test",
        "uid": "test",
        "_version": 10,
        "inbuilt_class": false,
        "schema": [
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
                "multiple": false,
                "non_localizable": false
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
                "unique": false,
                "non_localizable": false
            },
            {
                "data_type": "text",
                "display_name": "Rich text editor",
                "uid": "description",
                "field_metadata": {
                    "allow_rich_text": true,
                    "description": "",
                    "multiline": false,
                    "rich_text_type": "advanced",
                    "options": [],
                    "version": 3
                },
                "multiple": false,
                "mandatory": false,
                "unique": false,
                "non_localizable": false
            },
            {
                "data_type": "text",
                "display_name": "Rich text editor",
                "uid": "rich_text_editor",
                "field_metadata": {
                    "allow_rich_text": true,
                    "description": "",
                    "multiline": false,
                    "rich_text_type": "advanced",
                    "options": [],
                    "version": 3
                },
                "multiple": false,
                "mandatory": false,
                "unique": false,
                "non_localizable": false
            },
            {
                "data_type": "global_field",
                "display_name": "Global Field",
                "reference_to": "blt981fee3f999f3c12",
                "field_metadata": {
                    "description": ""
                },
                "uid": "global_field",
                "multiple": true,
                "max_instance": 50,
                "mandatory": false,
                "unique": false,
                "non_localizable": false,
                "schema": [
                    {
                        "display_name": "Name",
                        "uid": "name",
                        "data_type": "text",
                        "multiple": false,
                        "mandatory": false,
                        "unique": false,
                        "non_localizable": false,
                        "indexed": false,
                        "inbuilt_model": false
                    },
                    {
                        "data_type": "text",
                        "display_name": "Rich text editor",
                        "uid": "description",
                        "field_metadata": {
                            "allow_rich_text": true,
                            "description": "",
                            "multiline": false,
                            "rich_text_type": "advanced",
                            "options": [],
                            "version": 3
                        },
                        "multiple": false,
                        "mandatory": false,
                        "unique": false,
                        "non_localizable": false,
                        "indexed": false,
                        "inbuilt_model": false
                    },
                    {
                        "data_type": "file",
                        "display_name": "File",
                        "uid": "file_di",
                        "extensions": [],
                        "field_metadata": {
                            "description": "",
                            "rich_text_type": "standard"
                        },
                        "multiple": true,
                        "mandatory": false,
                        "unique": false,
                        "non_localizable": false,
                        "indexed": false,
                        "inbuilt_model": false
                    }
                ]
            },
            {
                "data_type": "file",
                "display_name": "File",
                "uid": "file_dinesh",
                "extensions": [],
                "field_metadata": {
                    "description": "",
                    "rich_text_type": "standard"
                },
                "multiple": false,
                "mandatory": false,
                "unique": false,
                "non_localizable": false
            },
            {
                "data_type": "group",
                "display_name": "Group",
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
                        "unique": false,
                        "non_localizable": false
                    }
                ],
                "uid": "group",
                "multiple": false,
                "mandatory": false,
                "unique": false,
                "non_localizable": false
            }
        ]
    } 
    
}