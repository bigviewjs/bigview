'use strict'

const BigView = require('../../../packages/bigview')

module.exports = class MyBigView extends BigView {
  before () {
    let self = this
     return new Promise(function(resolve, reject) {
       self.showPagelet = self.query.a
       resolve(true)
    })
  }

  afterRenderLayout () {
    let self = this

    if (self.showPagelet === '1') {
      self.run('pagelet1')
    } else {
      self.run('pagelet2')
    }

    // console.log('afterRenderLayout')
    return Promise.resolve(true)
  } 
}