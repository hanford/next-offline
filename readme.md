<h1 align="center">
  next-offline
</h1>

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

There are two important things to set up, first we need `next-offline` to wrap your next config.

If you haven't yet, create a `next.config.js` in your project.

```js
// next.config.js
const withOffline = require('next-offline')

const nextConfig = {
  ...
}

module.exports = withOffline(nextConfig)
```

Next we need to make sure our the application is properly serving the service worker, this setup depends on how you're hosting your application. There is [documentation](#serving-service-worker) below. If you're not using Now 2.0, the Now 1.0 example should work in most circumstances.

## Documentation
- [Serving service worker](#serving-service-worker)
  - [Now 1.0 / AWS](#now-10)
  - [Now 2.0](#now-20)
- [Registering service worker](#registering-service-worker)
  - [compile-time registration](#compile-time-registration)
  - [runtime registration](#runtime-registration)
- [Customizing service worker](#customizing-service-worker)
  - [Using workbox](#using-workbox)
  - [next-offline options](#next-offline-options)
- [Cache Strategies](#cache-strategies)
- [Service worker path](#service-worker-path)
- [next export](#next-export)
- [Development mode](#development-mode)
- [Next Offline 4.0](#next-offline-40)
- [License](#license-(mit))

## Serving service worker
Because service workers are so powerful, the API has some restrictions built in. For example, service workers must be served on the domain they're being used on - [you can't use a CDN](https://github.com/w3c/ServiceWorker/issues/940).

### Now 1.0
You'll want to use the next.js custom server API. The easiest way to do that is creating a `server.js` that looks like this:
```js
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

      // handle GET request to /service-worker.js
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
You can  read more about custom servers in the [Next.js docs](https://github.com/zeit/next.js#custom-server-and-routing)

If you're not hosting with Now, I'd probably follow the Now 1.0 approach because the custom server API can enable a lot of functionality, it just simply doesn't work well with Now 2.0 🙇‍♂️

### Now 2.0
Because Now 2.0 works so different than the previous version, so does serving the service worker. There are a few different ways to do this, but I'd recommend checking out [this now2 example app](https://github.com/hanford/next-offline/tree/master/examples/now2). The changes to be aware of are in the [now.json](https://github.com/hanford/next-offline/blob/master/examples/now2/now.json) and [next.config.js](https://github.com/hanford/next-offline/blob/master/examples/now2/next.config.js).

## Registering service worker
### Compile-time registration
By default `next-offline` will register a service worker with the script below, this is automatically added to your client side bundle once `withOffline` is invoked.

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).then(function (registration) {
      console.log('SW registered: ', registration)
    }).catch(function (registrationError) {
      console.log('SW registration failed: ', registrationError)
    })
  })
}
```

### Runtime registration
Alternative to compile-time, you can take control of registering/unregistering in your application code by using the `next-offline/runtime` module.

```js
import { register, unregister } from 'next-offline/runtime'

class App extends React.Component {
  componentDidMount () {
    register()
  }
  componentWillUnmount () {
    unregister()
  }
  ..
}
```

If you're handling registration on your own, pass `dontAutoRegisterSw` to next-offline.
```js
// next.config.js
const withOffline = require('next-offline')

module.exports = withOffline({ dontAutoRegisterSw: true })
```

## Customizing service worker

### Using workbox

If you're new to workbox, I'd recommend reading this [quick guide](https://developers.google.com/web/tools/workbox/guides/generate-service-worker/webpack#adding_runtime_caching) -- anything inside of `worboxOpts` will be passed to `workbox-webpack-plugin`.

Define a `workboxOpts` object in your `next.config.js` and it will gets passed to [workbox-webpack-plugin](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#generatesw_plugin). Workbox is what `next-offline` uses under the hood to generate the service worker, you can learn more about it [here](https://developers.google.com/web/tools/workbox/).

```js
// next.config.js
const withOffline = require('next-offline')

const nextConfig = {
  workboxOpts: {
    ...
  }
}

module.exports = withOffline(nextConfig)
```

### next-offline options
On top of the workbox options, next-offline has some options built in flags to give you finer grain control over how your service worker gets generated.

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Description</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>generateSw</td>
      <td>Boolean</td>
      <td>If false, next-offline will not generate a service worker and will instead try to modify workboxOpts.swSrc</td>
      <td>true</td>
    </tr>
    <tr>
      <td>dontAutoRegisterSw</td>
      <td>Boolean</td>
      <td>If true, next-offline won't automatically push the registration script into the application code. This is required if you're using runtime registration or are handling registration on your own.</td>
      <td>false</td>
    </tr>
    <tr>
      <td>devSwSrc</td>
      <td>String</td>
      <td>Path to be registered by next-offline during development. By default next-offline will register a noop during development</td>
      <td>false</td>
    </tr>
    <tr>
      <td>generateInDevMode</td>
      <td>Boolean</td>
      <td>If true, the service worker will also be generated in development mode. Otherwise the service worker defined in devSwSrc will be used.</td>
      <td>false</td>
    </tr>
    <tr>
      <td>registerSwPrefix</td>
      <td>String</td>
      <td>If your service worker isn't at the root level of your application, this can help you prefix the path. This is useful if you'd like your service worker on foobar.com/my/long/path/service-worker.js</td>
      <td>false</td>
    </tr>
    <tr>
      <td>scope</td>
      <td>String</td>
      <td>This is passed to the automatically registered service worker allowing increase or decrease what the service worker has control of.</td>
      <td>"/"</td>
    </tr>
    <tr>
      <td>transformManifest</td>
      <td>Function</td>
      <td>This is passed the manifest, allowing you to customise the list of assets for the service worker to precache.</td>
      <td>(manifest) => manifest</td>
    </tr>
  </tbody>
</table>

## Cache strategies
By default `next-offline` has the following blanket runtime caching strategy. If you customize `next-offline` with `workboxOpts`, the default behaviour will not be passed into `workbox-webpack-plugin`. This [article](https://developers.google.com/web/tools/workbox/guides/generate-service-worker/webpack#adding_runtime_caching) is great at breaking down various different cache recipes.
```js
{
  globPatterns: ['static/**/*'],
  globDirectory: '.',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200
        }
      }
    }
  ]
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
        handler: 'CacheFirst'
      },
      {
        urlPattern: /api/,
        handler: 'NetworkFirst',
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

## Service worker path
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

## Development mode
By default `next-offline` will add a no-op service worker in development. If you want to provide your own pass its filepath to `devSwSrc` option. This is particularly useful if you want to test web push notifications in development, for example.

```js
// next.config.js
const withOffline = require('next-offline')

module.exports = withOffline({
  devSwSrc: '/path/to/my/dev/service-worker.js'
})
```

You can disable this behavior by setting the `generateInDevMode` option to `true`.


## next export

In next-offline@3.0.0 we've rewritten the export functionality to work in more cases, more reliably, with less code thanks to some of the additions in Next 7.0.0!

You can read more about exporting at [Next.js docs]((https://github.com/zeit/next.js#static-html-export)) but next offline should Just Work™️.

## next offline 4.0
If you're upgrading to the latest version of `next-offline` I recommend glancing at what's been added/changed inside of [workbox in 4.x releases](https://github.com/GoogleChrome/workbox/releases) along with the 4.0 release which included the [breaking changes](https://github.com/GoogleChrome/workbox/releases/tag/v4.0.0). Next Offline's API hasn't changed, but a core depedency has!

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
