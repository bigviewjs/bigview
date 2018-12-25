'use strict'

var express = require('express')
var path = require('path')
var ejs = require('ejs')
var cookieParser = require('cookie-parser')
var httpextra = require('http-extra')
var app = express()


app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))


app.use((req, res, next) => {
  httpextra(res)
  return next()
})

app.engine('.html', ejs.__express)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html')
app.get('/', require('./basic'))


// app.listen(5000);
module.exports = app
