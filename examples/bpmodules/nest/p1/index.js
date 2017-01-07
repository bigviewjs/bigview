'use strict'

const Pagelet = require('../../../../packages/biglet')

module.exports = class MyPagelet extends Pagelet {
	constructor () {
		super()

		this.root = __dirname
		this.name = 'pagelet1'
		this.data = { 
            is: "pagelet1测试" ,
            po: {
                name: this.name
            }
        }
		this.location = 'pagelet1'
		this.tpl = 'p1.html'
		this.selector = 'pagelet1'
	}
    
    fetch() {
        return this.sleep(2000)
    }
    
    sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time))
    }
}
