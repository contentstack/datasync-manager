var replace = function(parent, schema, entry, asset) {
  var _entry = entry;
  var len = parent.length;
  for (var j = 0; j < len; j++) {
    if (j === (len - 1) && _entry[parent[j]]) {
      if (_entry[parent[j]] instanceof Array) {
        for (var i = 0, _i = _entry[parent[j]].length; i < _i; i++) {
          replace([i], schema, _entry[parent[j]]);
        }
      } else {
        switch (schema.data_type) {
        case 'text':
          var _matches2, __entry2, regex2;
          if (schema && schema.field_metadata && schema.field_metadata.markdown) {
            regex2 = new RegExp('(https://(dev-|stag-|)(assets|images).contentstack.io/v[\\d]/assets/(.*?)/(.*?)/(.*?)/(.*))', 'g');
          } else {
            regex2 = new RegExp('"(https://(dev-|stag-|)(assets|images).contentstack.io/v[\\d]/assets/(.*?)/(.*?)/(.*?)/(.*?))"', 'g');
          }
          __entry2 = _entry[parent[j]].slice(0);
          while ((_matches2 = regex2.exec(_entry[parent[j]])) !== null) {
            if (_matches2 && _matches2.length) {
              var _url = _matches2[1];
              var download_id = url.parse(_url).pathname.split('/').slice(4).join('/');
              var _obj = _assets[download_id];
              if (_obj && _obj['url'] && _obj['url'] === _url) {
                __entry2 = (schema && schema.field_metadata && schema.field_metadata.markdown) ? __entry2.replace(_url, encodeURI(_obj._internal_url) + '\n') : __entry2.replace(_url, _obj._internal_url);
              }
            }
          }
          _entry[parent[j]] = __entry2;
          break;
        }
      }
    } else {
      _entry = _entry[parent[j]];
      var _keys = _.clone(parent).splice(eval(j + 1), len);
      if (_entry instanceof Array) {
        for (var k = 0, _k = _entry.length; k < _k; k++) {
          replace(_keys, schema, _entry[k]);
        }
      } else if (typeof _entry != 'object') {
        break;
      }
    }
  }
};

const updateRTEMarkdownAssets = (assets, schema, entry) => {
  for (let i = 0, _i = schema.length; i < _i; i++) {
    if (schema[i].data_type === 'text' && (schema[i].field_metadata.markdown) || schema[i].field_metadata.rich_text_type) {
      parent.push(schema[i].uid)
      replace(parent, schema[i], entry, assets)
      parent.pop()
    }
    if (schema[i].data_type === 'group') {
      parent.push(schema[i].uid)
      updateRTEMarkdownAssets(assets, schema[i].schema, entry)
      parent.pop()
    }
    if (schema[i].data_type === 'blocks') {
      for (var j = 0, _j = schema[i].blocks.length; j < _j; j++) {
        parent.push(schema[i].uid)
        parent.push(schema[i].blocks[j].uid)
        updateRTEMarkdownAssets(assets, schema[i].blocks[j].schema, entry)
        parent.pop()
        parent.pop()
      }
    }
  }

  return entry
}