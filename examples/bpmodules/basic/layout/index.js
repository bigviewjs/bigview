const path = require('path')
const Biglet = require('../../../../packages/biglet')

module.exports = class LayoutPagelet extends Biglet {
  constructor () {
    super()
    this.root = __dirname
    this.name = 'layout biglet'
    this.data = {
      title: 'BigKoa',
      desc: 'bigbipe with koa',
      po: {
        name: this.name
      }
    }
    this.domid = 'layout'
    this.tpl = path.join(__dirname, './tpl/index')
    this.delay = 1000
  }

  fetch () {
    return this.sleep(this.delay)
  }

  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }
}
