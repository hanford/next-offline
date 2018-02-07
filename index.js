const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

const defaultOpts = {
  verbose: true,
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
    webpack(config, options) {
      if (!options.defaultLoaders) {
        throw new Error(
          'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
        )
      }

      config.plugins.push(
        new SWPrecacheWebpackPlugin(defaultOpts)
      )

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    }
  })
}
