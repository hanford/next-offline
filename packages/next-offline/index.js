const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { readFile, writeFile } = require('fs-extra');
const { join } = require('path');
const { cwd } = require('process');

const exportSw = require('./export');

// Next build metadata files that shouldn't be included in the pre-cache manifest.
const preCacheManifestBlacklist = ['react-loadable-manifest.json', 'build-manifest.json', /\.map$/];

// Directory where public assets must be placed in Next projects.
const nextAssetDirectory = 'static';

const defaultInjectOpts = {
  exclude: preCacheManifestBlacklist,
  modifyURLPrefix: {
    'static/': '_next/static/',
    'public/': '_next/public/',
  },
};

const defaultGenerateOpts = {
  ...defaultInjectOpts,
  // As of Workbox v5 Alpha there isn't a well documented way to move workbox runtime into the directory
  // required by Next. As a work around, we inline the tree-shaken runtime into the main Service Worker file
  // at the cost of less cacheability
  inlineWorkboxRuntime: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
};

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
      devSwSrc = join(__dirname, 'service-worker.js'),
      dontAutoRegisterSw = false,
      generateInDevMode = false,
      generateSw = true,
      // Before adjusting "registerSwPrefix" or "scope", read:
      // https://developers.google.com/web/ilt/pwa/introduction-to-service-worker#registration_and_scope
      registerSwPrefix = '',
      scope = '/',
      workboxOpts = {},
    } = nextConfig;

    const skipDuringDevelopment = options.dev && !generateInDevMode;

    // Generate SW
    if (skipDuringDevelopment) {
      // Simply copy development service worker.
      config.plugins.push(new CopyWebpackPlugin([devSwSrc]));
    } else if (!options.isServer) {
      // Only run once for the client build.
      config.plugins.push(
        // Workbox uses Webpack's asset manifest to generate the SW's pre-cache manifest, so we need
        // to copy the app's assets into the Webpack context so those are picked up.
        new CopyWebpackPlugin([{ from: `${join(cwd(), nextAssetDirectory)}/**/*` }]),
        generateSw
          ? new GenerateSW({ ...defaultGenerateOpts, ...workboxOpts })
          : new InjectManifest({ ...defaultInjectOpts, ...workboxOpts }),
      );
    }

    if (!skipDuringDevelopment) {
      // Register SW
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        const swCompiledPath = join(__dirname, 'register-sw-compiled.js');
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
