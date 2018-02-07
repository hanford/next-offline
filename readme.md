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
