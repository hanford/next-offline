const { copy } = require('fs-extra');
const { join } = require('path');

// Copies the generated Service Worker into the export folder if the Next.js app is being built as
// a Static HTML app
function exportSw(nextConfig) {
  return async function exportPathMap(...args) {
    const [defaultPathMap, { dev, distDir, outDir }] = args;
    const swDest = (nextConfig.workboxOpts && nextConfig.workboxOpts.swDest) || 'service-worker.js';

    if (!dev) {
      // Copy service worker from Next.js build dir into the export dir.
      await copy(join(distDir, swDest), join(outDir, swDest));
    }

    // Run user's exportPathMap function if available.
    return nextConfig.exportPathMap ? nextConfig.exportPathMap(...args) : defaultPathMap;
  };
}

module.exports = exportSw;
