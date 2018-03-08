'use strict'

const MyBigView = require('./MyBigView')
const DataStore = require('./DataStore')
const P1 = require('./p1')
const P2 = require('./p2')

module.exports = function (req, res) {
  var bigpipe = new MyBigView(req, res, 'basic/index', { title: '测试' })

  // main and layout setter
  bigpipe.dataStore = new DataStore()

  bigpipe.add(P1)
  bigpipe.add(P2)

  if (req.query && req.query.bigview_mode) {
    bigpipe.mode = req.query.bigview_mode
  }

  // 从this.cookies('bigview_mode') 其次
  // debug("this.cookies = " + req.cookies)
  if (req.cookies && req.cookies.bigview_mode) {
    bigpipe.mode = req.cookies.bigview_mode
  }

  // bigpipe.preview('aaaa.html')
  // bigpipe.isMock = true
  //  bigpipe.previewFile = 'aaaa.html'
  bigpipe.start()
}
