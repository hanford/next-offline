const path = require('path')
const { readFile, writeFile } = require('fs-extra')
const Precache = require('./next-files')
const { generateSW, injectManifest } = require('workbox-build')
const { join } = require('path')
const parseArgs = require('minimist')

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

  // Logic for working out dir and outdir copied from `next-export`:
  // https://github.com/zeit/next.js/blob/15dde33794622919d20709da97fa412a01831807/bin/next-export
  const argv = parseArgs(process.argv.slice(2), {
    alias: { o: 'outdir' },
    default: { o: null },
  })
  const dir = argv._[0] || '.'
  const outDir = join(process.cwd(), argv.outdir || 'out')

  const nextDir = join(process.cwd(), dir, distDir)
  const buildIdPath = join(nextDir, 'BUILD_ID')
  const buildId = await readFile(buildIdPath, 'utf8')

  const { precaches } = await Precache({buildId, nextDir})

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
