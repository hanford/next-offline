const WorkBoxWebpackPlugin = require('workbox-webpack-plugin')
const path = require('path')

const workboxDefaults = {
  globDirectory: '.next',
  globPatterns: ['**/*.{html,js}'],
  swDest: path.join('.next', 'sw.js'),
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      handler: 'networkFirst',
      urlPattern: /^https?.*/
    }
  ]
}

module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack (config, options) {
      if (!options.defaultLoaders) {
        throw new Error(
          'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
        )
      }

      const { worboxOpts = workboxDefaults } = nextConfig || config || options

      config.plugins.push(new WorkBoxWebpackPlugin({ ...workboxDefaults }))

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
