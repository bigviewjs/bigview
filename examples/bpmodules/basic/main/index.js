const Biglet = require('../../../../packages/biglet')

module.exports = class MainPagelet extends Biglet {
  constructor (...args) {
    super(...args)
    this.root = __dirname
    this.name = 'main biglet'
    this.data = {
      is: 'main biglet',
      po: {
        name: this.name
      }
    }
    this.domid = 'main'
    this.tpl = './tpl/index'
    this.delay = 1000
  }

  fetch () {
    return this.sleep(this.delay)
  }

  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }
}
