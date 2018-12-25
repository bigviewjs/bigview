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

app.use(function(req, res, next){
  res.stream = function(readableStream){
    console.log('stream')
    var that = this
    
    var s = readableStream//.pipe(that, { end: false });

    return s
  }

  next()
})

app.get('/stream', function (req, res) {
  console.log("/////")
  const fs = require("fs")
  res.stream(fs.createReadStream('./package.json'));

  setTimeout(function(){
    res.stream(fs.createReadStream('./lerna.json')).pipe(res, {end:true});
    // res.end()
  },1000)
  // res.stream(fs.createReadStream('./lerna.json'))//.pipe(res);

  // res.stream(fs.createReadStream('../lerna.json'))
  
})

app.get('/', require('./bpmodules/basic'))
// app.get('/redux', require('./bpmodules/redux'))



// app.get('/payload', require('./bpmodules/payload'))

// app.get('/error', require('./bpmodules/error'))

// app.get('/nest', require('./bpmodules/nest'))

// app.get('/nest2', require('./bpmodules/nest2'))

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
