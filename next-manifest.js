const glob = require('glob');
const { readFile, writeFile } = require('fs-extra');
const { resolve } = require('path');

const nextUrlPrefix = '/_next/';
const excludeFiles = ['react-loadable-manifest.json', 'build-manifest.json'];
const manifestDest = 'precache-manifest.*.js';
const manifestImportRegex = /(,\s*(\r\n|\r|\n)\s*)?"precache-manifest\.[^.]*\.js"(,\s*)?/;

/**
 * Workbox already generates a pretty good precache manifest for all the emitted
 * assets. There are a few things different though:
 *  - there are emitted files that are not used and don't need to be cached
 *  - all emitted assets need to be prefixed with /_next/
 *  - we don't need the revision as all the precacheable files are versioned
 *
 * At the end replace old manifest reference with new inlined one.
 */
async function generateNextManifest(options) {
  const manifestFilePath = resolve(options.outputPath, options.importsDirectory, manifestDest);
  const swFilePath = resolve(options.outputPath, options.swDest);

  const originalManifest = await getOriginalManifest(manifestFilePath);
  const nextManifest = buildNextManifest(originalManifest, options.urlPrefix);
  if (options.transformManifest) {
    const transformedManifest = options.transformManifest(nextManifest);
    await inlineManifest(transformedManifest, swFilePath);
  } else {
    await inlineManifest(nextManifest, swFilePath);
  }
}

function getOriginalManifest(manifestFilePath) {
  return new Promise((resolve, reject) => {
    glob(manifestFilePath, async (err, files = []) => {
      if (err) {
        return reject(err);
      }

      // Pick first and only as we've clean old ones.
      const file = await readFile(files[0], 'utf-8');
      // Execute file with a self variable in the scope/context.
      const self = {};
      new Function('self', file)(self);

      resolve(self.__precacheManifest);
    });
  });
}

function buildNextManifest(originalManifest, urlPrefix = '') {
  return originalManifest
    .filter(entry => !excludeFiles.includes(entry.url))
    .map(entry => ({
      url: `${urlPrefix}${nextUrlPrefix}${entry.url}`,
      revision: entry.revision
    }));
}

async function inlineManifest(manifest, swFilePath) {
  const originalSw = await readFile(swFilePath, 'utf8');

  // Prepend/inline newly generated precache manifest and remove import for old one.
  const newSw = `self.__precacheManifest = ${JSON.stringify(
    manifest,
    null,
    2,
  )};\n\n${originalSw.replace(manifestImportRegex, '')}`;

  await writeFile(swFilePath, newSw, 'utf8');
}

module.exports = generateNextManifest;
