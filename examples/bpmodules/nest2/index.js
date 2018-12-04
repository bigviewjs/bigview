'use strict'

const debug = require('debug')('bigview')
const fs = require('fs')
const MyBigView = require('./MyBigView')

module.exports = function (req, res) {
  const ctx = {
    req: req,
    res: res,
    render: function (tpl, data, cb) {
      if (/\.nj$/.test(tpl) || /\.html$/.test(tpl)) {
        res.render(tpl, data, (err, html) => {
          // ...
          cb(err, html)
        });

      } else {
        res.render(tpl, data, (err, html) => {
          // ...
          cb(err, html)
        });
      }
    }
  }
  var bigpipe = new MyBigView(ctx)

  var Pagelet1 = require('./p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./p2')
  // var pagelet2 = new Pagelet2()

  pagelet1.addChild(Pagelet2)

  bigpipe.add(pagelet1)

  // bigpipe.preview('aaaa.html')
  bigpipe.isMock = true
  bigpipe.previewFile = 'aaaa.html'

  bigpipe.start()
}