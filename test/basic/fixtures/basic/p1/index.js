'use strict'

const Pagelet = require('../../../../../packages/biglet')

module.exports = class MyPagelet extends Pagelet {
  constructor () {
      super()
      this.root = __dirname
      this.name = 'pagelet1'
      this.data = { is: "pagelet1测试" }
      this.selector = 'pagelet1'
      this.location = 'pagelet1'
      this.tpl = 'p1.html'
      this.delay = 4000
  }

  fetch () {
		let pagelet = this
		return require('./req')(pagelet)
	}
}
