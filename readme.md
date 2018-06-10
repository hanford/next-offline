# next-offline

Use [Workbox](https://github.com/GoogleChrome/workbox) with [Next.js](https://github.com/zeit/next.js) and easily enable offline functionality in your application.

## Installation

```sh
$ npm install --save next-offline
```

```sh
$ yarn add next-offline
```

## Usage

Create a `next.config.js` in your project

```js
// next.config.js
const withOffline = require('next-offline')

module.exports = withOffline()
```

Then create a `server.js`, because we'll need to serve out service worker.

```js
// server.js
const { createServer } = require('http')
const { join } = require('path')
const { parse } = require('url')
const next = require('next')

const app = next()
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl

      if (pathname === '/service-worker.js') {
        const filePath = join(__dirname, '.next', pathname)

        app.serveStatic(req, res, filePath)
      } else {
        handle(req, res, parsedUrl)
      }
    })
    .listen(3000, () => {
      console.log(`> Ready on http://localhost:${3000}`)
    })
  })
```

Optionally you can add your custom Next.js configuration as parameter

```js
// next.config.js
const withOffline = require('next-offline')

module.exports = withOffline({
  webpack(config, options) {
    return config
  }
})
```

## Options

If you want to customize your generated service worker, define a `workboxOpts` object in your `next.config.js` and it will gets passed to [workbox-webpack-plugin](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#generatesw_plugin)

By default `next-offline` has the following blanket runtime caching strategy. If you customize `next-offline` with `workboxOpts`, the default behaviour will not be passed into `workbox-webpack-plugin`
```js
{ urlPattern: /^https?.*/, handler: 'networkFirst' } // default cache strategy
```


```js
// next.config.js
const withOffline = require('next-offline')

module.exports = withOffline({
  workboxOpts: {
    runtimeCaching: [
      {
        urlPattern: /.png$/,
        handler: 'cacheFirst'
      },
      {
        urlPattern: /api/,
        handler: 'networkFirst',
        options: {
          cacheableResponse: {
            statuses: [0, 200],
            headers: {
              'x-test': 'true'
            }
          }
        }
      }
    ]
  }
})
```

By default `next-offline` will register a service worker with the script below, this is automatically added to your client side bundle once `withOffline` is invoked.

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
      console.log('SW registered: ', registration)
    }).catch(function (registrationError) {
      console.log('SW registration failed: ', registrationError)
    })
  })
}
```

This behavior can be disabled by passing in `dontAutoRegisterSw: true` to top level config object.


#### next export
If you're using `next export` you'll need to specify an [exportPathMap function](https://github.com/zeit/next.js#static-html-export)

<hr />

Questions? Feedback? [Please let me know](https://github.com/hanford/next-offline/issues/new)

## License (MIT)

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```
Copyright © 2017-present [Jack Hanford](http://jackhanford.com), jackhanford@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
