if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(registration => console.info('service worker registration successful'))
    .catch(err => console.warn('service worker registration failed', err.message))
}
