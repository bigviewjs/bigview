'use strict'

const Pagelet = require('../../../../packages/biglet')

module.exports = class MyPagelet extends Pagelet {
    constructor () {
        super()
        this.root = __dirname
        this.name = 'pagelet2'
        this.data =  {
            t: "测试" ,
            po: {
                name: this.name
            }
        }
        this.domid = 'pagelet2'
        this.tpl = 'p2'
        this.delay = 2000
    }
    
    fetch() {
      return this.sleep(this.delay)
    }
    
    sleep(time) {
      return new Promise((resolve)=> setTimeout(resolve, time))
    }
}
