'use strict';

var express = require('express');
var path = require('path');
var ejs = require('ejs');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

const MyBigView = require('./MyBigView')

app.get('/', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'basic/index', { title: "测试" })

  var Pagelet1 = require('./bpmodules/basic/p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./bpmodules/basic/p2')
  var pagelet2 = new Pagelet2()

  bigpipe.add(pagelet1)
  bigpipe.add(pagelet2)

  bigpipe.start()
});

app.get('/nest', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'nest/index', { title: "测试" })

  var Pagelet1 = require('./bpmodules/nest/p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./bpmodules/nest/p2')
  var pagelet2 = new Pagelet2()

  pagelet1.addChild(pagelet2)

  bigpipe.add(pagelet1)

  bigpipe.start()
});


app.get('/nest2', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'nest2/index', { title: "测试" })

  var Pagelet1 = require('./bpmodules/nest2/p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./bpmodules/nest2/p2')
  var pagelet2 = new Pagelet2()

  pagelet1.addChild(pagelet2)

  bigpipe.add(pagelet1)

  bigpipe.start()
});

// app.listen(5000);
module.exports = app
