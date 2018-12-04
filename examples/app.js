'use strict'

var express = require('express')
var path = require('path')
var ejs = require('ejs')
var cookieParser = require('cookie-parser')

var app = express()

app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.engine('.html', ejs.__express)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html')

app.get('/', require('./bpmodules/basic'))

app.get('/payload', require('./bpmodules/payload'))

app.get('/data', require('./bpmodules/dataStore'))

app.get('/error', require('./bpmodules/error'))

app.get('/nest', require('./bpmodules/nest'))

app.get('/nest2', require('./bpmodules/nest2'))

app.get('/default', function (req, res) {
  var pagelets = []

  pagelets.push(require('./bpmodules/basic/p1'))
  pagelets.push(require('./bpmodules/basic/p2'))

  res.render('basic/default', {
    title: 'default test',
    pagelets: pagelets
  })
})

// app.listen(5000);
module.exports = app
