function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(registration) {
      registration.unregister();
    });
  }
}

function register(swPath = '/service-worker.js') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register(swPath)
      .then(function(registration) {
        console.log('SW registered: ', registration);
      })
      .catch(function(registrationError) {
        console.log('SW registration failed: ', registrationError);
      });
  }
}

module.exports = {
  unregister,
  register
}