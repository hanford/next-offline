const { readdir } = require('fs')
const { join, resolve } = require('path')

function getBundles (app) {
  return new Promise(done => {
    readdir(`${app.nextDir}/bundles/pages`, (err, files = []) => {
      if (err) return done(app)

      const { bundle } = getDirectories(app.buildId)

      app.precaches = [
        ...app.precaches,
        ...createPaths(files, bundle, app.buildId)
      ]

      done(app)
    })
  })
}

function getChunks (app) {
  return new Promise(done => {
    readdir(`${app.nextDir}/chunks`, (err, files = []) => {
      if (err) return done(app)

      const { chunk: chunkDir } = getDirectories(app.buildId)

      app.precaches = [
        ...app.precaches,
        ...createPaths(files, chunkDir, app.buildId)
      ]

      done(app)
    })
  })
}

module.exports = async function Precache (id) {
  const app = {
    buildId: id,
    nextDir: resolve(join('./', '.next')),
    precaches: []
  }

  await getChunks(app)
  await getBundles(app)

  return app
}

const hasJs = file => /\.js$/.test(file)

function getDirectories (id) {
  return {
    chunk: '/_next/webpack/chunks',
    bundle: `/_next/${id}/page`
  }
}

function createPaths (files, path, id) {
  return files.filter(hasJs).map(file => ({url: join(path, file), revision: id}))
}
