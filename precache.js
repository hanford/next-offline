const { readdir } = require('fs')
const { join, resolve } = require('path')

function getBundles (app) {
  return new Promise(done => {
    readdir(`${app.nextDir}/bundles/pages`, (err, files = []) => {
      if (err) return done(app)

      const { bundle } = getDirectories(app.buildId)

      app.precaches = [
        ...app.precaches,
        ...createPaths(files, bundle)
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
        ...createPaths(files, chunkDir)
      ]

      done(app)
    })
  })
}

module.exports = async function Precache (dir, id) {
  const app = {
    buildId: id,
    precaches: [],
    nextDir: resolve(join(dir || './', '.next'))
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

function createPaths (files, path) {
  return files.filter(hasJs).map(file => join(path, file))
}
