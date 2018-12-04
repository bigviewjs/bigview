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

  bigpipe.add(require('./p1'))
  bigpipe.add(require('./p2'))

  // bigpipe.preview('aaaa.html')
  // bigpipe.isMock = true
  bigpipe.previewFile = 'aaaa.html'
  bigpipe.start()
}