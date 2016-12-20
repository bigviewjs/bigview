'use strict'

const debug = require('debug')('bigview')
const fs = require('fs')
const MyBigView = require('./MyBigView')

module.exports = function (req, res) {
  var bigpipe = new MyBigView(req, res, 'nest2/index', { title: "测试" })

  var Pagelet1 = require('./p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./p2')
  var pagelet2 = new Pagelet2()

  pagelet1.addChild(Pagelet2)

  bigpipe.add(pagelet1)

  // bigpipe.preview('aaaa.html')
  bigpipe.isMock = true
  bigpipe.previewFile = 'aaaa.html'

  bigpipe.start()
}