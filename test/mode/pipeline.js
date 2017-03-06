import test from 'ava'

const sinon = require('sinon')
// 初始化bigview
// 增加biglet1
// 增加biglet2
// 增加biglet3
// 异步输出

const Bigview = require("../../packages/bigview")
const Biglet = require("../../packages/biglet")

// module.exports = class MyPagelet extends Pagelet {
//   constructor () {
//       super()
//       this.root = __dirname
//       this.name = 'pagelet1'
//       this.data = { 
//           is: "pagelet1测试",
//           po: {
//               name: this.name
//           }
//       }
//       this.domid = 'pagelet1'
//       this.location = 'pagelet1'
//       // this.tpl = 'tpl/p1.html'
//       this.delay = 4000
//   }
  
//   fetch() {
//     return this.sleep(this.delay)
//   }
  
//   sleep(time) {
//     return new Promise((resolve)=> setTimeout(resolve, time))
//   }

// }
const ModeInstanceMappings = require('../../packages/bigview/mode')

const Utils = require('../../packages/bigview/utils')

test.cb('GET /', t => {
    let req = {}
    let res = {
      render:function(tpl, data){
        return data
      }
    }
    let bigview = new Bigview(req, res, 'tpl', {})
    bigview.mode = 'pipeline'

    let result = []

    var p1 = new Biglet()
    p1.owner = bigview
    p1.fetch = function () {
      return sleep(3000).then(function(){
        // console.log('p1')
        result.push('p1')
      })
    }

    p1.parse = function(){
      return Promise.reject(new Error('p1 reject'))
    }

    var p2 = new Biglet()
    p2.owner = bigview
    p2.fetch = function () {
      return sleep(1000).then(function(){
        // console.log('p2')
        result.push('p2')
      })
    }

    p2.parse = function(){
      return Promise.reject(new Error('p2 reject'))
    }

    let pagelets = [p1, p2]

    bigview.getModeInstanceWith('pipeline').execute(pagelets).then(function(){
      // console.log(result)
      t.is(result[0], 'p2')
      t.is(result[1], 'p1')

      t.end()
    })
})

function sleep(time) {
    return new Promise((resolve)=> setTimeout(resolve, time))
}