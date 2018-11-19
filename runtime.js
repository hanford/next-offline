export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}

export function register(swPath = '/service-worker.js') {
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
