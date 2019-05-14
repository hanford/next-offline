const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { readFile, writeFile } = require('fs-extra');
const { join } = require('path');

const InlineNextPrecacheManifestPlugin = require('./plugin');
const exportSw = require('./export');

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  exportPathMap: exportSw(nextConfig),
  webpack(config, options) {
    if (!options.defaultLoaders) {
      throw new Error(
        'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade',
      );
    }

    const {
      assetPrefix,
      generateSw = true,
      dontAutoRegisterSw = false,
      devSwSrc = join(__dirname, 'service-worker.js'),
      registerSwPrefix = '',
      scope = '/',
      generateInDevMode = false,
      transformManifest = manifest => manifest,
      workboxOpts = {
        globPatterns: ['static/**/*'],
        globDirectory: '.',
        runtimeCaching: [
          {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'offlineCache',
              expiration: {
                maxEntries: 200
              }
            }
          }
        ],
      },
    } = nextConfig;

    const skipDuringDevelopment = options.dev && !generateInDevMode

    // Generate SW
    if (skipDuringDevelopment) {
      // Simply copy development service worker.
      config.plugins.push(new CopyWebpackPlugin([devSwSrc]));
    } else if (!options.isServer) {
      // Only run once for the client build.
      config.plugins.push(
        new CleanWebpackPlugin(['precache-manifest.*.js'], { root: config.output.path, verbose: false }),
        generateSw ? new GenerateSW({ ...workboxOpts }) : new InjectManifest({ ...workboxOpts }),
        new InlineNextPrecacheManifestPlugin({
          outputPath: config.output.path,
          urlPrefix: assetPrefix,
          swDest: workboxOpts.swDest || 'service-worker.js',
          importsDirectory: workboxOpts.importsDirectory || '',
          transformManifest
        }),
      );
    }

    if (!skipDuringDevelopment) {
      // Register SW
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        const swCompiledPath = join(__dirname, 'register-sw-compiled.js')
        // See https://github.com/zeit/next.js/blob/canary/examples/with-polyfills/next.config.js for a reference on how to add new entrypoints
        if (
          entries['main.js'] &&
          !entries['main.js'].includes(swCompiledPath) &&
          !dontAutoRegisterSw
        ) {
          let content = await readFile(require.resolve('./register-sw.js'), 'utf8');
          content = content.replace('{REGISTER_SW_PREFIX}', registerSwPrefix);
          content = content.replace('{SW_SCOPE}', scope);

          await writeFile(swCompiledPath, content, 'utf8');

          entries['main.js'].unshift(swCompiledPath);
        }
        return entries;
      };
    }

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});
