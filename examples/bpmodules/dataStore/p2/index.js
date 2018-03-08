'use strict'

const Pagelet = require('../../../../packages/biglet')

module.exports = class MyPagelet extends Pagelet {
  constructor () {
    super()
    this.root = __dirname
    this.name = 'pagelet2'
    this.data = {
      is: '000',
      discount: {
        name: 111
      },
      po: {
        name: 222
      },
      t: 333
    }
    this.domid = 'pagelet2'
    this.tpl = 'p2.html'
    this.delay = 2000
  }

  fetch () {
    return this.sleep(this.delay)
  }

  parse () {
    let data = {
      t: '测试',
      po: this.data.po,
      discount: this.dataStore.discount
    }

    return Promise.resolve(this.data = data)
  }

  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }
}
