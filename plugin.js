const generateNextManifest = require('./next-manifest');

module.exports = class InlineNextPrecacheManifestPlugin {
  constructor(opts) {
    this.opts = opts;
  }

  apply(compiler) {
    compiler.plugin(
      'done',
      async () => {
        await generateNextManifest(this.opts);
      },
      err => {
        throw new Error(`Precached failed: ${err.toString()}`);
      },
    );
  }
};
