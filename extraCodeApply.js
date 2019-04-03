const { readFileSync, appendFileSync } = require('fs');
const { join } = require('path');

module.exports = class ExtraCodeApply {
    constructor(opts) {
        this.opts = opts;
    }

    apply(compiler) {
        compiler.hooks.done.tap('CopyPlugin', () => {
            if (!this.opts.extraCodePath) return;
            const extraCode = readFileSync(join(this.opts.baseDir, this.opts.extraCodePath));
            if (this.opts.verbose) console.log(`Adding ${extraCode}`);
            appendFileSync(join(this.opts.outputPath, this.opts.swDest), `\n${extraCode}\n`);
        })
    }
}