
# Changelog

## v4.0.3 2019-07-31
- tapPromise should be used instead of tap properly handle async service worker file save.
tap is for sync plugins based on documentation.

## v4.0.2 2019-06-03

- Stop including examples and tests in NPM module

## v4.0.1 2019-05-21

- When running in dev mode exportPathMap should also be executed 

## v4.0.0 2019-05-13

- Upgrade workbox-webpack-plugin from 3.6.3 to 4.3.1

## v3.4.0 2019-05-08

- add new transformManifest function  that allows you to provide a function to modify the manifest, and add/remove items which will be pre-cached.


## v3.3.8 2019-04-10

- add support for workboxOpts.importsDirectory

## v3.3.7 2019-03-22

- when `generateInDevMode` is true, dont add register-sw-compiled to bundle many times

## v3.3.6 2019-02-28

- Ensure we're not modifying config.entry during development when generateInDev is false

## v3.3.5 2019-01-18

- remove object property shorthand syntax for more ES5 compatibility

## v3.3.4 2019-01-17

- remove default function argument in favor of an ES5 compatible way of defaulting

## v3.3.3 2019-01-05

- remove arrow function in favor of function keyword in runtime.js to prevent IE11 exception

## v3.3.2 2019-01-05

- default scope option to `/`

## v3.3.1 2018-12-12

- add `generateInDevMode` to next-offline options allowing service worker be generated and registered during development

## v3.3.0 2018-12-9

- add `scope` to next-offline options allowing service worker scope to be modified for automatically registered service-workers
- add `examples/` directory with Now 1.0 and Now 2.0 examples
- fix handling absolute paths by using `path.resolve()` instead of `path.join()`