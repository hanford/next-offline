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

const read = util.promisify(fs.readFile);
const access = util.promisify(fs.access);
const remove = util.promisify(rimraf);

const cwd = process.cwd();

const forceProd = require('./forceProd');

beforeEach(async () => {
  jest.setTimeout(20000);

  await remove(join(cwd, '.next'));
  await remove(join(cwd, 'static/manifest'));
});

test('build next app with manifest and service worker', async () => {
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
  await access(join(cwd, '.next/service-worker.js'), fs.constants.F_OK);
  const str = await read(join(cwd, '.next/main.js'), 'utf8');
  expect(str).toEqual(expect.stringContaining('serviceWorker'));
});
