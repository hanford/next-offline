/**
 @jest-environment node
 **/
const nextBuild = require("next/dist/build");
const withManifest = require("next-manifest");
const withOffline = require("next-offline");
const { withPlugins } = require("next-compose-plugins");

const util = require("util");
const { join } = require("path");
const fs = require("fs");
const rimraf = require("rimraf");

const read = util.promisify(fs.readFile);
const access = util.promisify(fs.access);
const remove = util.promisify(rimraf);

const cwd = process.cwd();

const forceProd = require("./forceProd");

beforeEach(() => {
  jest.setTimeout(20000);
  return Promise.all([
    remove(join(cwd, ".next")),
    remove(join(cwd, "static/manifest"))
  ]);
});

test("build next app", () => {
  const nextConf = {};
  return nextBuild.default(cwd, nextConf);
});

test("builds next app without next-offline, only next-manifest", () => {
  const NAME = "WithManifest";

  const nextConf = forceProd(withManifest({ manifest: { name: NAME } }));

  return nextBuild
    .default(cwd, nextConf)
    .then(() => {
      return read(join(cwd, "static/manifest/manifest.json"), "utf8");
    })
    .then(str => {
      const manifest = JSON.parse(str);
      expect(manifest.name).toBe(NAME);
    });
});

test("build next app with service worker", () => {
  const nextConf = withOffline();

  return nextBuild.default(cwd, nextConf).then(() => {
    return Promise.all([
      access(join(cwd, ".next/service-worker.js"), fs.constants.F_OK),
      read(join(cwd, ".next/main.js"), "utf8").then(str => {
        expect(str).toEqual(expect.stringContaining("serviceWorker"));
      })
    ]);
  });
});

test("build next app with manifest and service worker", () => {
  const NAME = "WithBoth";
  const manifest = {
    name: NAME
  };

  const nextConf = withOffline(forceProd(withManifest({ manifest })));

  // const nextConf = withPlugins([
  //   [withManifest, { manifest }],
  //   [forceProd],
  //   [withOffline]
  // ])

  return nextBuild.default(cwd, nextConf).then(() => {
    return Promise.all([
      read(join(cwd, "static/manifest/manifest.json"), "utf8").then(str => {
        const manifest = JSON.parse(str);
        expect(manifest.name).toBe(NAME);
      }),
      access(join(cwd, ".next/service-worker.js"), fs.constants.F_OK),
      read(join(cwd, ".next/main.js"), "utf8").then(str => {
        expect(str).toEqual(expect.stringContaining("serviceWorker"));
      })
    ]);
  });
});
