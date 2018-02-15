importScripts('https://unpkg.com/workbox-sw@2.1.2/build/importScripts/workbox-sw.prod.v2.1.2.js')

const workboxSW = new WorkboxSW({
  'skipWaiting': true,
  'clientsClaim': true
})

// set precache listed item
workboxSW.precache(${precache})

workboxSW.router.registerRoute(
  '/',
  workboxSW.strategies.staleWhileRevalidate()
)

workboxSW.router.registerRoute(/^https?.*/, workboxSW.strategies.networkFirst({}), 'GET')
