const SwGen = require('./plugin')
const { GenerateSW } = require('workbox-webpack-plugin')
const path = require('path')

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack (config, options) {
    if (!options.defaultLoaders) {
      throw new Error('This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade')
    }

    if (typeof nextConfig.webpack === 'function') {
      config = nextConfig.webpack(config, options)
    }

    if (options.dev) return config

    const {
      dontAutoRegisterSw = false,
      workboxOpts = {
        runtimeCaching: [
          { urlPattern: /^https?.*/, handler: 'networkFirst' }
        ]
      }
    } = nextConfig || config || options

    config.plugins = [
      ...config.plugins,
      new GenerateSW({ ...workboxOpts }),
      new SwGen({ buildId: options.buildId })
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
