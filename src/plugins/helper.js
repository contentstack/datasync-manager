const { cloneDeep } = require('lodash')
const { getConfig } = require('../index')

exports.buildReferences = (entry, schema, parent = []) => {
  for (let i = 0, c = schema.length; i < c; i++) {
    switch (schema[i].data_type) {
    case 'reference':
      if (!(schema[i].reference_to instanceof Array)) {
        parent.push(schema[i].uid)
        update(parent, schema[i].reference_to, entry)
        parent.pop()
      }
      break
    case 'group':
      parent.push(schema[i].uid)
      this.buildReferences(entry, schema[i].schema, parent)
      parent.pop()
      break
    case 'blocks':
      for (let j = 0, d = schema[i].blocks.length; j < d; j++) {
        parent.push(schema[i].uid)
        parent.push(schema[i].blocks[j].uid)
        this.buildReferences(entry, schema[i].blocks[j].schema, parent)
        parent.pop()
        parent.pop()
      }
      break
    }
  }

  return entry
}

exports.buildReferencePaths = (schema, entryReferences = {}, assetReferences = {}, parent) => {
  for (let i = 0, l = schema.length; i < l; i++) {
    const field = schema[i]
    if (field && field.data_type) {
      if (field.data_type === 'reference') {
        const fieldPath = ((parent) ? `${parent}.${schema[i].uid}`: field.uid)
        // all references will now be an array
        // example: { _reference: { field1.product: [''] } }
        entryReferences[fieldPath] = (typeof field.reference_to === 'string') ? [field.reference_to] : field.reference_to
      } else if (field.data_type === 'file') {
        const fieldPath = ((parent) ? `${parent}.${field.uid}`: field.uid)
        assetReferences[fieldPath] = '_assets'
      } else if (field.data_type === 'group' && field.schema) {
        this.buildReferencePaths(field.schema, entryReferences, assetReferences, ((parent) ? `${parent}.${field.uid}`: field.uid))
      } else if (field.data_type === 'blocks' && Array.isArray(field.blocks)) {
        const blockParent = ((parent)) ? `${parent}.${field.uid}`: `${field.uid}`
        field.blocks.forEach((block) => {
          if (block && block.schema && Array.isArray(block.schema)) {
            let subBlockParent = `${blockParent}.${block.uid}`
            this.buildReferencePaths(block.schema, entryReferences, assetReferences, subBlockParent)
          }
        })
      }
    }
  }

  return { entryReferences, assetReferences }
}

const update = (parent, reference, entry) => {
  const len = parent.length
  for (let j = 0; j < len; j++) {
    if (entry && parent[j]) {
      if (j === (len - 1) && entry[parent[j]]) {
        if (reference !== '_assets') {
          let elem = entry[parent[j]]
          if (elem && typeof elem === 'object') {
            const arr = []
            elem.forEach((uid) => {
              arr.push({
                _content_type_uid: reference,
                uid
              })
            })
            entry[parent[j]] = arr
          } else {
            entry[parent[j]] = {
              _content_type_uid: reference,
              uid: [entry[parent[j]]],
            }
          }
        }
      } else {
        entry = entry[parent[j]]
        const keys = cloneDeep(parent).splice((j + 1), len)
        if (Array.isArray(entry)) {
          for (let i = 0, l = entry.length; i < l; i++) {
            update(keys, reference, entry[i])
          }
        } else if (typeof entry !== 'object') {
          break
        }
      }
    }
  }
}

exports.hasRteOrMarkdown = (schema) => {
  try {
    if (typeof schema === 'object' && Array.isArray(schema)) {
      for (let i = 0, j = schema.length; i < j; i++) {
        const field = schema[i]
        if (field && field.field_metadata && field.field_metadata.markdown) {
          return true
        } else if (field && field.field_metadata && field.field_metadata.allow_rich_text) {
          return true
        } else if (field && field.data_type === 'group' && field.schema) {
          if (this.hasRteOrMarkdown(field.schema)) {
            return true
          }
          continue
        } else if (field && field.data_type === 'blocks' && field.blocks) {
          for (let x = 0, y = field.blocks.length; x < y; x++) {
            if (this.hasRteOrMarkdown(field.blocks[x].schema)) {
              return true
            }
          }
        }
      }
    }
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

exports.hasReferences = (schema) => {
  return checkReferences(schema, 'entry')
}

exports.hasAssetsOrReferences = (schema) => {
  return checkReferences(schema, ['asset', 'entry'])
}

const checkReferences = (schema, key) => {
  try {
    if (typeof schema === 'object' && Array.isArray(schema)) {
      for (let i = 0, j = schema.length; i < j; i++) {
        const field = schema[i]
        if (field && field.data_type === 'file' && typeof key === 'object') {
          return true
        } else if (field && field.reference_to) {
          return true
        } else if (field && field.data_type === 'group' && field.schema) {
          if (checkReferences(field.schema, key)) {
            return true
          }
          continue
        } else if (field && field.data_type === 'blocks' && field.blocks) {
          for (let x = 0, y = field.blocks.length; x < y; x++) {
            if (checkReferences(field.blocks[x].schema, key)) {
              return true
            }
          }
        }
      }
    }
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

exports.buildAssetObject = (asset, locale, entry_uid, content_type_uid, isInit) => {
  const { contentstack } = getConfig()
  // add locale key to inside of asset
  asset.locale = locale
  asset._isInit = isInit
  const regexp = new RegExp(contentstack.regexp.asset_pattern.url, contentstack.regexp.asset_pattern.options)
  const matches = regexp.exec(asset.url)

  if (!(matches[5]) || matches[5].length === 0) {
    throw new Error('Unable to determine fine name.\n' + JSON.stringify(matches))
  }
  asset.filename = matches[5]

  return {
    _content_type_uid: '_assets',
    ...asset,
    _type: 'publish',
    entry_content_type: content_type_uid,
    entry_reffered_in: entry_uid,
    locale,
    uid: asset.uid
  }
}