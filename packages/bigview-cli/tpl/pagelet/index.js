const Pagelet = require('biglet')

module.exports = class QPagelet extends Pagelet {
  constructor() {
    super()
    this.root = __dirname
    this.domid = '{{name}}'
  }

  fetch() {
    return Promise.resolve()
  }
  
  parse() {
      return Promise.resolve()
  }
}
