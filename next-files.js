const glob = require('glob')
const { join } = require('path')

function getBundles (app) {
  return new Promise(done => {
    glob('**/*.js', { cwd: `${app.nextDir}/bundles/pages` }, (err, files = []) => {
      if (err) return done(app)

      const { bundle } = getDirectories(app.buildId)

      app.precaches = [
        ...app.precaches,
        ...createPaths(files, bundle, app.buildId, app.assetPrefix)
      ]

      done(app)
    })
  })
}

function getChunks (app) {
  return new Promise(done => {
    glob('**/*.js', { cwd: `${app.nextDir}/chunks` }, (err, files = []) => {
      if (err) return done(app)

      const { chunk: chunkDir } = getDirectories(app.buildId)

      app.precaches = [
        ...app.precaches,
        ...createPaths(files, chunkDir, app.buildId, app.assetPrefix)
      ]

      done(app)
    })
  })
}

module.exports = async function Precache ({ buildId, nextDir, assetPrefix }) {
  const app = {
    buildId,
    nextDir,
    assetPrefix,
    precaches: []
  }

  await getChunks(app)
  await getBundles(app)

  return app
}

function getDirectories (id) {
  return {
    chunk: '/_next/webpack/chunks',
    bundle: `/_next/${id}/page`
  }
}

function createPaths (files, path, id, assetPrefix) {
  const prefix = assetPrefix || ''
  return files.map(file => ({url: `${prefix}${join(path, file)}`, revision: id}))
}
