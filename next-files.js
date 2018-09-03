const { join } = require('path')
const glob = require('glob')
const urljoin = require('url-join')

module.exports = async function getNextFiles(options) {
  return [
    ...(await precacheFiles(options, 'bundles/pages', '**/*.js')),
    ...(await precacheFiles(options, 'chunks', '**/*.js')),
    ...(await precacheFiles(options, 'static', '**/*.{js,css}')),
  ]
}

function precacheFiles(options, basePath, globPattern) {
  const { buildId, assetPrefix, nextDir } = options
  const cwd = join(nextDir, basePath)

  return new Promise((resolve, reject) => {
    glob(globPattern, { cwd }, (err, files = []) => {
      if (err) {
        return reject(err)
      }

      const exportPath = exportPathMap(buildId)[basePath]
      const precache = createPrecache(files, exportPath, buildId, assetPrefix)
      resolve(precache)
    })
  })
}

function exportPathMap(id) {
  return {
    'bundles/pages': `/_next/${id}/page`,
    chunks: '/_next/webpack/chunks',
    static: `/_next/static`,
  }
}

function createPrecache(files, path, id, prefix = '') {
  return files.map(file => ({ url: urljoin(prefix, path, file), revision: id }))
}
