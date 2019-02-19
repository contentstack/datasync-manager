const findAssets = (schema, entry, bucket) => {
  var matches, regexp
  if (schema && schema.field_metadata && schema.field_metadata.markdown) {
    regexp = new RegExp('(https://(assets|images).contentstack.io/v[\\d]/assets/(.*?)/(.*?)/(.*?)/(.*))', 'g');
  } else {
    regexp = new RegExp('[\"](https://(assets|images).contentstack.io/v[\\d]/assets/(.*?)/(.*?)/(.*?)/(.*?))[\"]', 'g');
  }
  while ((matches = regexp.exec(entry)) !== null) {
    if (matches && matches.length) {
      let assetObject = {}
      let assetUrl = matches[1]
      if (matches[5]) {
        assetObject.uid = matches[5]
      }
      if (matches[1]) {
        assetObject.url = assetUrl
        assetObject.download_id = url.parse(assetUrl).pathname.split('/').slice(4).join('/')
        // no point in adding an object, that has no 'url'
        // even if the 'asset' is found, we do not know its version
        bucket.push(assetObject)
      }
    }
  }
}

const get = (parent, schema, entry, bucket) => {
  const len = parent.length
  for (let j = 0; j < len; j++) {
    entry = entry[parent[j]]
    if (typeof entry !== 'object') {
      continue
    } else if (j === (len - 1) && entry) {
      if (entry instanceof Array) {
        for (let i = 0, _i = entry.length; i < _i; i++) {
          findAssets(schema, entry[i], bucket)
        }
      } else {
        findAssets(schema, entry, bucket)
      }
    } else {
      const keys = clone(parent).splice(eval(j + 1), len)
      if (entry instanceof Array) {
        for (let m = 0, _m = entry.length; m < _m; m++) {
          get(keys, schema, entry[m], bucket)
        }
      }
    }
  }
}

export const getRTEMarkdownAssets = (schema, entry, bucket = [], parent = []) => {
  for (let i = 0, _i = schema.length; i < _i; i++) {
    if (schema[i].data_type === 'text') {
      parent.push(schema[i].uid)
      get(parent, bucket, schema[i], entry)
      parent.pop()
    } else if (schema[i].data_type === 'group') {
      parent.push(schema[i].uid)
      getRTEMarkdownAssets(schema[i].schema, entry, bucket, parent)
      parent.pop()
    } else if (schema[i].data_type === 'blocks') {
      for (let j = 0, _j = schema[i].blocks.length; j < _j; j++) {
        parent.push(schema[i].uid)
        parent.push(schema[i].blocks[j].uid)
        getRTEMarkdownAssets(schema[i].blocks[j].schema, entry, bucket, parent)
        parent.pop()
        parent.pop()
      }
    }
  }
}