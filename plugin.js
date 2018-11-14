const generateNextManifest = require('./next-manifest');

module.exports = class InlineNextPrecacheManifestPlugin {
  constructor(opts) {
    this.opts = opts;
  }

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.done.tap(
        'CopyPlugin',
        async () => {
          await generateNextManifest(this.opts);
        },
        err => {
          throw new Error(`Precached failed: ${err.toString()}`);
        },
      );
    } else {
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
  }
};
