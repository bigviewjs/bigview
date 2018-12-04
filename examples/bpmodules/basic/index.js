'use strict'

const MyBigView = require('./MyBigView')
const Main = require('./main')
const Layout = require('./layout')
const P1 = require('./p1')
const P2 = require('./p2')

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

  // main and layout setter
  bigpipe.main = Main
  bigpipe.layout = Layout

  bigpipe.mode = 'pipeline'
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
  // bigpipe.previewFile = 'aaaa.html'
  bigpipe.start()
}
