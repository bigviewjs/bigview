'use strict'

const Pagelet = require('../../../../packages/biglet')

module.exports = class MyPagelet extends Pagelet {
  constructor () {
    super()
    this.root = __dirname
    this.name = 'pagelet1'
    this.data = {
      is: 'pagelet1测试',
      po: {
        name: this.name
      }
    }
    this.domid = 'pagelet1'
    this.location = 'pagelet1'
      // this.tpl = 'tpl/p1.html'
    this.delay = 4000
  }

  fetch () {
    return this.sleep(this.delay)
  }

  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }
}
