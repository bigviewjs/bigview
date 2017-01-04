'use strict'

const debug = require('debug')('bigview')
const fs = require('fs')
const MyBigView = require('./MyBigView')

module.exports = function (req, res) {
  var bigpipe = new MyBigView(req, res, 'basic/index', { title: "测试" })
  bigpipe.mode = 'render'
  bigpipe.add(require('./p1'))
  bigpipe.add(require('./p2'))

  // bigpipe.preview('aaaa.html')
  // bigpipe.isMock = true
 //  bigpipe.previewFile = 'aaaa.html'
  bigpipe.start()
}