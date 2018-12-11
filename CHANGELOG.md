
# Changelog

## v3.3.0 2018-12-9

- add `scope` to next-offline options allowing service worker scope to be modified for automatically registered service-workers
- add `examples/` directory with Now 1.0 and Now 2.0 examples
- fix handling absolute paths by using `path.resolve()` instead of `path.join()`