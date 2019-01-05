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
      workboxOpts = {
        globPatterns: ['static/**/*'],
        globDirectory: '.',
        runtimeCaching: [{ urlPattern: /^https?.*/, handler: 'networkFirst' }],
      },
    } = nextConfig;

    // Generate SW
    if (options.dev && !generateInDevMode) {
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
        }),
      );
    }

    // Register SW
    const originalEntry = config.entry;
    config.entry = async () => {
      const entries = await originalEntry();
      if (entries['main.js'] && !dontAutoRegisterSw) {
        let content = await readFile(require.resolve('./register-sw.js'), 'utf8');
        content = content.replace('{REGISTER_SW_PREFIX}', registerSwPrefix);
        content = content.replace('{SW_SCOPE}', scope);

        await writeFile(join(__dirname, 'register-sw-compiled.js'), content, 'utf8');

        entries['main.js'].unshift(require.resolve('./register-sw-compiled.js'));
      }
      return entries;
    };

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});
