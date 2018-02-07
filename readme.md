# Next.js + sw-precache

Use [sw-precache](https://github.com/GoogleChrome/sw-precache) with [Next.js](https://github.com/zeit/next.js)

## Installation

```
npm install --save next-offline
```

or

```
yarn add next-offline
```

## Usage

Create a `next.config.js` in your project

```js
// next.config.js
const withOffline = require('next-offline')
module.exports = withOffline()
```

Then create a `server.js`

```js
// server.js
const { createServer } = require('http')
const next = require('next')
const { join } = require('path')

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
    .listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
```

Finally you'll need to ensure you're registering the service worker in each of your pages. `next-offline` comes with a HOC that will wrap your component which you can see the usage below:

```js
// pages/index.js
import withOffline from 'next-offline/hoc'

class Index extends PureComponent {
  ..

  render () {
    return (
      <h1>Im the index page!</h1>
    )
  }
}

export default withOffline(Index)
```

Alternatively you can register the service worker manually

```js
// pages/index.js
export default class Index extends PureComponent {
  componentDidMount () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => console.info('service worker registration successful'))
        .catch(err => console.warn('service worker registration failed', err.message))
    }
  }
  ..
}
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
