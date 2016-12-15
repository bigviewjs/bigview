'use strict'

const Pagelet = require('../../').Pagelet

console.dir(Pagelet)

module.exports = class MyPagelet extends Pagelet {
	constructor () {
		super()
		this.root = __dirname
		this.name = 'pagelet1'
		this.data = { is: "pagelet1测试" }
		this.location = 'pagelet1'
		this.tpl = 'p1.html'
		this.selector = 'pagelet1'
		this.delay = 2000
	}
}
