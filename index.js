const SwGen = require('./plugin')
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin')
const path = require('path')
const { readFile, writeFile } = require('fs-extra')
const Precache = require('./next-files')

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  async exportPathMap (toto, tatat,titi) {
    if (!nextConfig.exportPathMap || typeof nextConfig.exportPathMap !== 'function') {
      return {}
    }


    const nextDir = path.join(process.cwd(), '.next')
    const buildIdPath = path.join(nextDir, 'BUILD_ID')
    const buildId = await readFile(buildIdPath, 'utf8')

    const { precaches } = await Precache({buildId, nextDir})

    const outDir = path.join(process.cwd(), nextConfig.outDir || 'out')
    const swDest = path.join(outDir , 'service-worker.js');

    // globDirectory is intentionally left blank as it's required by workbox
    await require('workbox-build').generateSW({
      swDest,
      globDirectory: ' ',
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
          handler: 'cacheFirst',
          options: {
            expiration: {
              maxEntries: 20,
            }
          }
        }, {
          urlPattern: /^https?.*/,
          handler: 'networkFirst'
        }
      ]
    })

    const serviceWorkerContent = await readFile(swDest, 'utf8')
    const newServiceWorkerContent = `self.__precacheManifest = ${JSON.stringify(precaches)};\n${serviceWorkerContent}`;
    writeFile(swDest, newServiceWorkerContent)

    return nextConfig.exportPathMap()
  },
  webpack (config, options) {
    if (!options.defaultLoaders) {
      throw new Error('This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade')
    }

    if (typeof nextConfig.webpack === 'function') {
      config = nextConfig.webpack(config, options)
    }

    if (options.dev) return config

    const {
      generateSw = true,
      dontAutoRegisterSw = false,
      workboxOpts = {
        runtimeCaching: [
          { urlPattern: /^https?.*/, handler: 'networkFirst' }
        ]
      }
    } = nextConfig || config || options

    config.plugins = [
      ...config.plugins,
      generateSw
        ? new GenerateSW({ ...workboxOpts })
        : new InjectManifest({ ...workboxOpts }),
      new SwGen({ buildId: options.buildId, assetPrefix: options.config.assetPrefix })
    ]

    const originalEntry = config.entry

    config.entry = async () => {
      const entries = await originalEntry()

      if (entries['main.js'] && !dontAutoRegisterSw) {
        entries['main.js'].unshift(require.resolve('./register-sw.js'))
      }

      return entries
    }

    return config
  }
})
