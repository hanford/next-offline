const hoistStatics = require('hoist-non-react-statics')
const { Component, createElement } = require('react')

module.exports = function withServiceWorker (Component) {
  class withServiceWorkerComponent extends Component {
    componentDidMount () {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => console.info('service worker registration successful'))
          .catch(err => console.warn('service worker registration failed', err.message))
      }
    }

    render () {
      return createElement(Component, this.props)
    }
  }

  return hoistStatics(withServiceWorkerComponent, Component)
}
