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
        this.delay = 4000
    }
}
