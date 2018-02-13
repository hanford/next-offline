const WorkBoxWebpackPlugin = require('workbox-webpack-plugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

const isEmptyObject = require('is-empty-object')
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

const preCacheDefaults = {
  verbose: false,
  minify: true,
  staticFileGlobsIgnorePatterns: [/\.next\//],
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

      const { swPreCacheOptions = {}, UNSAFE_workbox = false } = nextConfig || config || options

      const opts = isEmptyObject(swPreCacheOptions)
        ? preCacheDefaults
        : Object.assign({}, defaultOpts, swPreCacheOptions)

      if (UNSAFE_workbox) {
        config.plugins.push(
          new WorkBoxWebpackPlugin({ ...workboxDefaults, ...opts })
        )
      } else {
        config.plugins.push(
          new SWPrecacheWebpackPlugin(opts)
        )
      }

      const originalEntry = config.entry

      config.entry = async () => {
        const entries = await originalEntry()

        if (entries['main.js']) {
          entries['main.js'].unshift(require.resolve(opts.registerPath ? opts.registerPath : './sw.js'))
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
