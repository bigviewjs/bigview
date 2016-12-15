'use strict';

var express = require('express');
var path = require('path');
var ejs = require('ejs');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

const MyBigView = require('./MyBigView')
const MyPagelet = require('./MyPagelet')

app.get('/', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'basic/index', { title: "测试" })

  var pagelet1 = new MyPagelet('pagelet1', { is: "pagelet1测试" })

  pagelet1.location = 'pagelet1'
  pagelet1.root = 'views'
  pagelet1.tpl = 'basic/p1.html'
  pagelet1.selector = 'pagelet1'
  pagelet1.delay = 2000

  var pagelet2 = new MyPagelet('pagelet2', 'basic/p', { t: "测试" })
  pagelet2.selector = 'pagelet2'
  pagelet2.location = 'pagelet2'
  pagelet2.root = 'views'
  pagelet2.tpl = 'basic/p2.html'
  pagelet2.delay = 4000

  bigpipe.add(pagelet1)
  bigpipe.add(pagelet2)

  bigpipe.start()
});

app.get('/nest', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'nest/index', { title: "测试" })

  var pagelet1 = new MyPagelet('pagelet1', { is: "pagelet1测试" })

  pagelet1.location = 'pagelet1'
  pagelet1.root = 'views'
  pagelet1.tpl = 'nest/p1.html'
  pagelet1.selector = 'pagelet1'
  pagelet1.delay = 2000

  var subPagelet = new MyPagelet('pagelet2', 'nest/p', { t: "测试" })
  subPagelet.selector = 'pagelet2'
  subPagelet.location = 'pagelet2'
  subPagelet.root = 'views'
  subPagelet.tpl = 'nest/p2.html'
  subPagelet.delay = 4000

  pagelet1.addChild(subPagelet)

  bigpipe.add(pagelet1)

  bigpipe.start()
});

app.listen(5000);
