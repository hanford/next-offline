const SwGen = require('./plugin')
const { GenerateSW } = require('workbox-webpack-plugin')
const path = require('path')

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack (config, { buildId, ...options }) {
    if (!options.defaultLoaders) {
      throw new Error('This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade')
    }

    const {
      workboxOpts = {
        runtimeCaching: [
          { urlPattern: /^https?.*/, handler: 'networkFirst' }
        ]
      }
    } = nextConfig || config || options

    config.plugins = [
      ...config.plugins,
      new GenerateSW({ ...workboxOpts }),
      new SwGen({ buildId })
    ]

    const originalEntry = config.entry

    config.entry = async () => {
      const entries = await originalEntry()

      if (entries['main.js']) {
        entries['main.js'].unshift(require.resolve('./register-sw.js'))
      }

      return entries
    }

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options)
    }

    return config
  }
})
