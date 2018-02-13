// 'use strict'

// const fs = require('fs')
// const path = require('path')
// const precache = require('./precache.js')

// module.exports = class WebpackPlugin {
// 	constructor (opts) {
// 		this.opts = Object.assign({
// 			filename: 'service-worker.js',
// 			placeholder: '${precache}',
// 			serviceWorker: ''
// 		}, opts)

// 		if (!this.opts.serviceWorker) {
// 			this.opts.serviceWorker = fs.readFileSync(path.resolve(process.cwd(), './sw.js'), 'utf8')
// 		}
// 	}

// 	apply (compiler) {
// 		compiler.plugin('after-emit', (compilation, callback) => {
//       this.opts.filename = path.join(compiler.options.output.path, this.opts.filename)

// 			callback()
// 		})

// 		compiler.plugin('done', () => {
// 			precache().then(manifest => {
// 				const sw = this.opts.serviceWorker.replace(this.opts.placeholder, JSON.stringify(manifest.precaches, null, 2))

// 				fs.writeFileSync(this.opts.filename, sw, 'utf8')
// 			}, err => {
// 				throw new Error(`Precached failed: ${err.toString()}`)
// 			})
// 		})
// 	}
// }
