/*!
* Contentstack Sync Manager: Sample plugin to create a sitemap
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
const cheerio = require('cheerio')
const fs = require('fs')
const js2xmlparser = require('js2xmlparser')
const path = require('path')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const extractUrls = (xml) => {
  const urls = []
  const $ = cheerio.load(xml, {
    xmlMode: true
  });

  $('url').each(function () {
    urls.push({
      loc: $(this).find('loc').text(),
      changefreq: $(this).find('changefreq').text(),
      priority: $(this).find('priority').text()
    })
  })

  return urls
}

const checkDuplicate = (map, data_url) => {
  for (let i = 0; i < map.length; i++) {
    if (map.loc === data_url) {
      return true
    }
  }
}

const map = (entry) => {
  return new Promise((resolve, reject) => {
    const urlset = {
      '@': {
        'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:video': 'http://www.google.com/schemas/sitemap-video/1.1'
      }
    }
    const skipUrls = ['/404', '/search']
    let siteXmlContent
    if (entry.url && /\/thank-you$/i.test(entry.url) === false) {
      const frequency = 'weekly'
      const priority = '0.5'

      const hostname = 'https://www.contentstack.com'
      const url = entry.url
      const absUrl = hostname + url
      const siteMapPath = path.join(__dirname, 'map.xml')
      
      if (fs.existsSync(siteMapPath)) {
        return readFile(siteMapPath).then((data) => {
          const sitemap = extractUrls(data)

          if (skipUrls.indexOf(entry.url) === -1) {
            // check for duplicates
            const isDuplicate = checkDuplicate(sitemap, absUrl)
            if (isDuplicate) {
              urlset.url = sitemap
              siteXmlContent = js2xmlparser.parse('urlset', urlset)
            } else {
              sitemap.push({
                loc: absUrl,
                changefreq: frequency,
                priority
              })
              urlset.url = sitemap
              siteXmlContent = js2xmlparser.parse('urlset', urlset)
            }
            return writeFile(siteMapPath, siteXmlContent.toString())
            .then(resolve)
            .catch(reject)
          }
        })
      }
    }
    return resolve()
  })
}

module.exports = function Plugins (pluginOptions) {
  let options = pluginOptions

  Plugins.afterPublish = (input) => {
    return new Promise((resolve, reject) => {
      if (input.hasOwnProperty('content_type')) {
        const entry = input.data
        const contentType = input.content_type
        if (entry.url && typeof entry.url === 'string' && contentType.options.is_page) {
          return map(entry, contentType)
            .then(resolve)
            .catch(reject)
        }
      }
      return resolve()
    })
  }

  Plugins.afterUnpublish = (input) => {
    return new Promise((resolve, reject) => {
      if (input.hasOwnProperty('content_type')) {
        const entry = input.data
        const contentType = input.content_type
        if (entry.url && typeof entry.url === 'string' && contentType.options.is_page) {
          return map(entry, contentType)
            .then(resolve)
            .catch(reject)
        }
      }
      return resolve()
    })
  }
}
