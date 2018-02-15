const SwGen = require('./plugin')
const path = require('path')

const offlineDefaults = {
  filename: 'service-worker.js',
  placeholder: '${precache}',
  serviceWorker: ''
}

module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack (config, { buildId, ...options }) {

      if (!options.defaultLoaders) {
        throw new Error(
          'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
        )
      }

      const { offlineOpts = offlineDefaults } = nextConfig || config || options

      config.plugins.push(new SwGen({ ...offlineOpts, buildId }))

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
}
