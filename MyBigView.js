const BigView = require('.').BigView

module.exports = class MyBigView extends BigView {  
  constructor (req, res, layout, data) {
    super (req, res, layout, data)
  }
  loadData (str) {
    return new Promise(function (resolve, reject) {
      console.log('renderLayout = ' + str)
      resolve({
        a: 1,
        b: 2
      })
    })
  }
  
  // before () {
  //    return new Promise(function(resolve, reject) {
  //       setTimeout(function(){
  //         resolve(true)
  //       }, 1000)
  //   })
  // }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  processError (err) {
    console.log(err)
  }
}