const { cloneDeep } = require('lodash')

exports.buildAssetReferences = (entry, schema) => {
  return buildContentReferences(entry, schema, [], true)
}

exports.buildEntryReferences = (entry, schema) => {
  return buildContentReferences(entry, schema, [], false)
}

exports.buildReferences = (schema, entryReferences = {}, assetReferences = {}, parent) => {
  for (let i = 0, l = schema.length; i < l; i++) {
    const field = schema[i]
    if (field && field.data_type) {
      if (field.data_type === 'reference') {
        const fieldPath = ((parent) ? `${parent}.${schema[i].uid}`: field.uid)
        entryReferences[fieldPath] = field.reference_to
      } else if (field.data_type === 'file') {
        const fieldPath = ((parent) ? `${parent}.${field.uid}`: field.uid)
        assetReferences[fieldPath] = '_assets'
      } else if (field.data_type === 'group' && field.schema) {
        this.buildReferences(field.schema, entryReferences, assetReferences, ((parent) ? `${parent}.${field.uid}`: field.uid))
      } else if (field.data_type === 'blocks' && Array.isArray(field.blocks)) {
        const blockParent = ((parent)) ? `${parent}.${field.uid}`: `${field.uid}`
        field.blocks.forEach((block) => {
          if (block && block.schema && Array.isArray(block.schema)) {
            let subBlockParent = `${blockParent}.${block.uid}`
            this.buildReferences(block.schema, entryReferences, assetReferences, subBlockParent)
          }
        })
      }
    }
  }

  return { entryReferences, assetReferences }
}

const buildContentReferences = (entry, schema, parent = [], isAsset) => {
  for (let i = 0, c = schema.length; i < c; i++) {
    switch (schema[i].data_type) {
    case 'reference':
      if (!(isAsset) && !(schema[i].reference_to instanceof Array)) {
        parent.push(schema[i].uid)
        update(parent, schema[i].reference_to, entry)
        parent.pop()
      }
      break
    case 'file':
      if (isAsset) {
        parent.push(schema[i].uid)
        update(parent, '_assets', entry)
        parent.pop()
      }
      break
    case 'group':
      parent.push(schema[i].uid)
      buildContentReferences(entry, schema[i].schema, parent, isAsset)
      parent.pop()
      break
    case 'blocks':
      for (let j = 0, d = schema[i].blocks.length; j < d; j++) {
        parent.push(schema[i].uid)
        parent.push(schema[i].blocks[j].uid)
        buildContentReferences(entry, schema[i].blocks[j].schema, parent, isAsset)
        parent.pop()
        parent.pop()
      }
      break
    }
  }

  return entry
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
              uid: entry[parent[j]],
            }
          }
        } else {
          if (Array.isArray(entry[parent[j]])) {
            const assetsArr = []
            for (let k = 0; k < entry[parent[j]].length; k++) {
              assetsArr.push({
                _content_type_uid: '_assets',
                uid: entry[parent[j]][k]
              })
            }
            entry[parent[j]] = assetsArr
          } else {
            entry[parent[j]] = {
              _content_type_uid: reference,
              uid: entry[parent[j]],
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

exports.hasAssets = (schema) => {
  return checkReferences(schema, 'asset')
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
        if (field && field.data_type === 'file' && (key === 'asset' || typeof key === 'object')) {
          return true
        } else if (field && field.reference_to && (key === 'entry' || typeof key === 'object')) {
          return true
        } else if (field && field.data_type === 'group' && field.schema) {
          if (checkReferences(field.schema, key)) {
            return true
          }
          continue
        } else if (field && field.data_type === 'blocks' && field.blocks) {
          for (let x = 0, y = field.blocks; x < y; x++) {
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