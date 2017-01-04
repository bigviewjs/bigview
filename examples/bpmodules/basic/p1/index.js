'use strict'

const Pagelet = require('../../../../packages/biglet')

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
  
  fetch() {
    return this.sleep(this.delay)
  }
  
  sleep(time) {
    return new Promise((resolve)=> setTimeout(resolve, time))
  }
  
  compile(tpl, data) {
    const ejs = require('ejs')
    ejs.cache = require('lru-cache')(1000)
    let self = this

    return new Promise(function(resolve, reject) {
      ejs.renderFile(tpl, data, self.options, function(err, str) {
        // str => Rendered HTML string
        if (err) {
          console.log(err)
          reject(err)
        }

        resolve(str)
      })
    })
  }
}
