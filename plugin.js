const fs = require('fs-extra');
const { join } = require('path');
const nextFiles = require('./next-files.js');

module.exports = class NextFilePrecacherPlugin {
  constructor(opts) {
    this.opts = {
      filename: 'service-worker.js',
      ...opts
    };
  }

  apply(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      this.opts.filename = join(
        compiler.options.output.path,
        this.opts.filename
      );
      this.opts.outputPath = compiler.options.output.path;

      callback();
    });

    compiler.plugin(
      'done',
      async () => {
        const sw = await fs.readFile(
          join(this.opts.outputPath, 'service-worker.js'),
          'utf8'
        );
        const newPrecacheManifest = await nextFiles({
          buildId: this.opts.buildId,
          nextDir: this.opts.outputPath,
          assetPrefix: this.opts.assetPrefix
        });

        // Prepend/inline newly generated precache manifest and remove import for old one.
        const manifestImportRegex = /(,\s*)?"precache-manifest\..*\.js"/;
        const newSw = `self.__precacheManifest = ${JSON.stringify(
          newPrecacheManifest,
          null,
          2
        )};\n\n${sw.replace(manifestImportRegex, '')}`;

        return await fs.writeFile(this.opts.filename, newSw, 'utf8');
      },
      err => {
        throw new Error(`Precached failed: ${err.toString()}`);
      }
    );
  }
};
