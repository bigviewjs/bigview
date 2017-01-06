'use strict'

const Pagelet = require('../../../../packages/biglet')

module.exports = class MyPagelet extends Pagelet {
    constructor () {
        super()
        this.root = __dirname
        this.name = 'pagelet2'
        this.data =  {t: "测试" }
        this.selector = 'pagelet2'
        this.location = 'pagelet2'
        this.tpl = 'p2.html'
    }
    
    fetch() {
        return this.sleep(4000)
    }
    
    sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time))
    }
}
