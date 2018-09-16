const { readFile, writeFile } = require('fs-extra');
const Precache = require('./next-files');
const { generateSW, injectManifest } = require('workbox-build');
const { join, resolve } = require('path');
const parseArgs = require('minimist');

const dev = process.env.NODE_ENV !== 'production';

module.exports = Export;

async function Export(nextConfig) {
  const {
    distDir = '.next',
    exportPathMap,
    generateSw = true,
    workboxOpts = {
      runtimeCaching: [{ urlPattern: /^https?.*/, handler: 'networkFirst' }]
    }
  } = nextConfig;

  if (dev || typeof exportPathMap !== 'function') {
    return {};
  }

  // Logic for working out dir and outdir copied from `next-export`:
  // https://github.com/zeit/next.js/blob/15dde33794622919d20709da97fa412a01831807/bin/next-export
  const argv = parseArgs(process.argv.slice(2), {
    alias: { o: 'outdir' },
    default: { o: null }
  });
  const dir = argv._[0] || '.';
  const outDir = argv.outdir ? resolve(argv.outdir) : resolve(dir, 'out');

  const nextDir = join(process.cwd(), dir, distDir);
  const buildIdPath = join(nextDir, 'BUILD_ID');
  const buildId = await readFile(buildIdPath, 'utf8');

  const { precaches } = await Precache({ buildId, nextDir });

  const swDest = join(outDir, 'service-worker.js');

  if (generateSw) {
    // globDirectory is intentionally left blank as it's required by workbox
    await generateSW({ swDest, globDirectory: ' ', ...workboxOpts });
  } else {
    // So that the same file works as part of `next build` and `next export`
    const injectionPointRegexp = /(__precacheManifest\s*=\s*)\[\](.*)/;
    await injectManifest({
      swDest,
      globDirectory: ' ',
      injectionPointRegexp,
      ...workboxOpts
    });
  }

  const serviceWorkerContent = await readFile(swDest, 'utf8');
  const newServiceWorkerContent = `self.__precacheManifest = ${JSON.stringify(
    precaches
  )};\n${serviceWorkerContent}`;

  writeFile(swDest, newServiceWorkerContent);

  return nextConfig.exportPathMap();
}
