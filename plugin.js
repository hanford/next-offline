const generateNextManifest = require('./next-manifest');

module.exports = class InlineNextPrecacheManifestPlugin {
  constructor(opts) {
    this.opts = opts;
  }

  apply(compiler) {
    const errorhandler = err => {
      throw new Error(`Precached failed: ${err.toString()}`);
    };

    if (compiler.hooks) {
      compiler.hooks.done.tapPromise('GenerateSW', () =>
        generateNextManifest(this.opts).catch(errorhandler),
      );
    } else {
      compiler.plugin('done', () => generateNextManifest(this.opts), errorhandler);
    }
  }
};
