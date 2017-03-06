import test from 'ava'
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

test('GET /', t => {
    console.log(Bigview)
    let req = {}
    let res = {}
    let bigview = new Bigview(req, res, 'tpl', {})
    bigview.mode = 'pipelin'
    console.log(bigview.modeInstance)


  t.pass()
})


