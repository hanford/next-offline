const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const isEmptyObject = require('is-empty-object')

const defaultOpts = {
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

      const { swPreCacheOptions = {} } = nextConfig || config || options

      const opts = isEmptyObject(swPreCacheOptions) ? defaultOpts : Object.assign({}, defaultOpts, swPreCacheOptions)

      config.plugins.push(
        new SWPrecacheWebpackPlugin(opts)
      )

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
