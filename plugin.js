const fs = require('fs-extra')
const { join } = require('path')
const nextFiles = require('./next-files.js')

module.exports = class NextFilePrecacherPlugin {
  constructor (opts) {
    this.opts = {
      filename: 'service-worker.js',
      ...opts
    }
  }

  apply (compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      this.opts.filename = join(compiler.options.output.path, this.opts.filename)
      this.opts.outputPath = compiler.options.output.path

      callback()
    })

    compiler.plugin('done', async () => {
      const manifest = await nextFiles(this.opts.buildId)
      const genSw = await fs.readFile(join(this.opts.outputPath, 'service-worker.js'), 'utf8')

      const newSw =
        `self.__precacheManifest = ${JSON.stringify(manifest.precaches, null, 2)}`
        + '\n'
        + genSw.replace(genSw.match(/"precache-manifest.*/)[0], '')

      return await fs.writeFile(this.opts.filename, newSw, 'utf8')
    }, err => {
      throw new Error(`Precached failed: ${err.toString()}`)
    })
  }
}
