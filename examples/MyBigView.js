const BigView = require('../packages/bigview')

module.exports = class MyBigView extends BigView {
  before () {
     return new Promise(function(resolve, reject) {
        setTimeout(function(){
          resolve(true)
        }, 0)
    })
  }

  // after () {
  //
  // }  
}