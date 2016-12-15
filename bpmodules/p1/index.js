const Pagelet = require('.').Pagelet

module.exports = class MyPagelet extends Pagelet {
	constructor () {
		this.location = 'this'
		this.root = __dirname
		this.tpl = 'p1.html'
		this.selector = 'this'
		this.delay = 2000
	}
}
