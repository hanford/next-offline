/**
@jest-environment node
**/

const nextBuild = require('next/dist/build');
const withManifest = require('next-manifest');
const withOffline = require('next-offline');

const util = require('util');
const { join } = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const forceProd = require('./forceProd');

const read = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const access = util.promisify(fs.access);
const remove = util.promisify(rimraf);
const cwd = process.cwd();

// Creates a RegExp for finding a file with a Next build hash.
function getFileHashRegex(fileName, extension) {
  return new RegExp(`${fileName}([-\\w])*\\.${extension}$`);
}

function getNextBuildFilePath(filePath) {
  return join(cwd, '.next', filePath);
}

async function readBuildFile(filePath) {
  return read(getNextBuildFilePath(filePath), 'utf8');
}

// Read a directory and returns the file path for the first file name matching the provided RegExp.
async function findHashedFileName(directoryPath, regexTest) {
  const files = await readdir(directoryPath);
  return files.find((filePath) => regexTest.test(filePath));
}

beforeEach(async () => {
  jest.setTimeout(20000);

  await remove(getNextBuildFilePath(''));
  await remove(join(cwd, 'static/manifest'));
});

test('withOffline builds a service worker file with auto-registration logic', async () => {
  const nextConf = forceProd(withOffline());

  await nextBuild.default(cwd, nextConf);
  await access(getNextBuildFilePath('service-worker.js'), fs.constants.F_OK);

  // Check registration logic exists
  const mainFileName = await findHashedFileName(getNextBuildFilePath('static/runtime'), getFileHashRegex('main', 'js'));
  const mainFileContents = await readBuildFile(`static/runtime/${mainFileName}`);
  expect(mainFileContents).toEqual(expect.stringContaining('serviceWorker'));
});

test('withOffline builds a service worker file without auto-registration logic when the consumer opts out', async () => {
  const nextConf = forceProd(withOffline({ dontAutoRegisterSw: true }));

  await nextBuild.default(cwd, nextConf);
  await access(getNextBuildFilePath('service-worker.js'), fs.constants.F_OK);

  const mainFileName = await findHashedFileName(getNextBuildFilePath('static/runtime'), getFileHashRegex('main', 'js'));
  const mainFileContents = await readBuildFile(`static/runtime/${mainFileName}`);
  expect(mainFileContents).not.toEqual(expect.stringContaining('serviceWorker'));
});

test('withOffline includes static assets and build artifacts in its service worker pre-cache', async () => {
  const nextConf = forceProd(withOffline());

  await nextBuild.default(cwd, nextConf);
  const serviceWorkerContents = await readBuildFile('service-worker.js');

  // Check that various bundles are getting entered into pre-cache manifest
  expect(serviceWorkerContents).toEqual(expect.stringContaining('/pages/_app.js'));
  expect(serviceWorkerContents).toEqual(expect.stringContaining('_next/static/chunks/commons.'));

  // Check that static asset copying via glob pattern is working as expected
  expect(serviceWorkerContents).toEqual(expect.stringContaining('_next/static/image.jpg'));
});

test('withOffline pre-caches the generated manifest from withManifest', async () => {
  const nextConf = forceProd(
    withOffline(
      withManifest({
        manifest: {
          name: 'next-app',
        },
      }),
    ),
  );
  await nextBuild.default(cwd, nextConf);

  const serviceWorkerContent = await readBuildFile('service-worker.js');
  expect(serviceWorkerContent).toEqual(expect.stringContaining('_next/static/manifest/manifest.json'));
});

// TODO: unskip this when https://github.com/GoogleChrome/workbox/issues/2138 is fixed
test.skip('withOffline respects "swDest"', async () => {
  const customSWDest = './static/service-worker.js';

  const nextConf = forceProd(withOffline({
    workboxOpts: { swDest: customSWDest }
  }));

  await nextBuild.default(cwd, nextConf);
  await access(getNextBuildFilePath(customSWDest), fs.constants.F_OK);
});
