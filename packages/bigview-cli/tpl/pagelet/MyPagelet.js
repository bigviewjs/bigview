'use strict'

const Pagelet = require('biglet')

module.exports = class MyPagelet extends Pagelet {
  constructor () {
    super()
    this.root = __dirname
    this.name = '{{name}}'
    this.data =  {t: "测试" }
    this.selector = '{{name}}'
    this.location = '{{name}}'
    this.tpl = 'index.html'
    this.delay = 0
  }

  fetch () {
		let pagelet = this
		return require('./req')(pagelet)
	}
}
