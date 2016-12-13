const BigView = require('.').BigView

module.exports = class MyBigView extends BigView {
  // before () {
  //    return new Promise(function(resolve, reject) {
  //       setTimeout(function(){
  //         resolve(true)
  //       }, 1000)
  //   })
  // }

  processError (err) {
    console.log(err)
  }
    //
  // after () {
  //
  // }
}