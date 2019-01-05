
# Changelog

## v3.3.1 2019-01-05

- default scope option to `/`

## v3.3.1 2018-12-12

- add `generateInDevMode` to next-offline options allowing service worker be generated and registered during development

## v3.3.0 2018-12-9

- add `scope` to next-offline options allowing service worker scope to be modified for automatically registered service-workers
- add `examples/` directory with Now 1.0 and Now 2.0 examples
- fix handling absolute paths by using `path.resolve()` instead of `path.join()`