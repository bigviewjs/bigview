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
  
  processError (err) {
    // let self = this
    // // throw new Error('need impl')
    // return new Promise(function (resolve, reject) {
    //   if(err) reject(err)
    //   self.end()
    // })
  }
}