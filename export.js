const path = require('path')
const { readFile, writeFile } = require('fs-extra')
const Precache = require('./next-files')
const { generateSW, injectManifest } = require('workbox-build')
const { join } = require('path')

module.exports = Export

async function Export (nextConfig) {
  const {
    distDir = '.next',
    exportPathMap,
    workboxOpts = {
      runtimeCaching: [
        { urlPattern: /^https?.*/, handler: 'networkFirst' }
      ]
    }
  } = nextConfig

  if (typeof exportPathMap !== 'function') {
    return {}
  }

  const nextDir = join(process.cwd(), distDir)
  const buildIdPath = join(nextDir, 'BUILD_ID')
  const buildId = await readFile(buildIdPath, 'utf8')

  const { precaches } = await Precache({buildId, nextDir})

  const outDir = join(process.cwd(), nextConfig.outDir || 'out')
  const swDest = join(outDir , 'service-worker.js')

  await generateSW({ swDest, globDirectory: ' ', ...workboxOpts })

  // if (generateSw) {
    // globDirectory is intentionally left blank as it's required by workbox
  // } else {
  //   await injectManifest({ swDest, globDirectory: ' ', ...workboxOpts })
  // }

  const serviceWorkerContent = await readFile(swDest, 'utf8')
  const newServiceWorkerContent = `self.__precacheManifest = ${JSON.stringify(precaches)};\n${serviceWorkerContent}`

  writeFile(swDest, newServiceWorkerContent)

  return nextConfig.exportPathMap()
}
