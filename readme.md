<p align="center">
  <strong>📶 next-offline</strong>
</p>

<p align="center">
Use <a href='https://github.com/GoogleChrome/workbox'>Workbox</a> with <a href='https://github.com/zeit/next.js'>
Next.js</a> and <br />easily enable offline functionality in your application!
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/next-offline">
    <img src="https://img.shields.io/npm/dy/next-offline.svg">
  </a>
  <a href="https://www.npmjs.com/package/next-offline">
    <img src="https://img.shields.io/npm/v/next-offline.svg?maxAge=3600&label=next-offline&colorB=007ec6">
  </a>
  <img src="https://img.shields.io/github/repo-size/hanford/next-offline.svg" />
</p>

<br/>

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

const app = next({ dev: process.env.NODE_ENV !== 'production' })
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
{
  globPatterns: ['static/**/*'],
  globDirectory: '.',
  { urlPattern: /^https?.*/, handler: 'networkFirst' }
}
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

If your application doesn't live on the root of your domain, you can use `registerSwPrefix`. This is helpful if your application is on domain.com/my/custom/path because by default `next-offline` assumes your application is on domain.com and will try to register domain.com/service-worker.js. We can't support using `assetPrefix` because service workers must be served on the root domain. For a technical breakdown on that limitation, see the following link: [Is it possible to serve service workers from CDN/remote origin?](https://github.com/w3c/ServiceWorker/issues/940)

By default `next-offline` will precache all the Next.js webpack emitted files and the user-defined static ones (inside `/static`) - essentially everything that is exported as well.

If you'd like to include some more or change the origin of your static files use the given workbox options:

```js
workboxOpts: {
  globPatterns: ['app/static/**/*', 'any/other/fileglob/to/cache'],
  globDirectory: '.',
  modifyUrlPrefix: {
    'app': assetPrefix,
  },
  runtimeCaching: {...}
}
```


By default `next-offline` will add a no-op service worker in development. If you want to provide your own pass its filepath to `devSwSrc` option. This is particularly useful if you want to test web push notifications in development, for example.

```js
// next.config.js
const withOffline = require('next-offline')

module.exports = withOffline({
  devSwSrc: '/path/to/my/dev/service-worker.js'
})
```


#### next export

In next-offline@3.0.0 we've rewritten the export functionality to work in more cases, more reliably, with less code thanks to some of the additions in Next 7.0.0!

You can read more about exporting at [Next.js docs]((https://github.com/zeit/next.js#static-html-export)) but next offline should Just Work™️.

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
