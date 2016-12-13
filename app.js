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

app.get('/index.html', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'index', { title: "测试" })

  var pagelet1 = new MyPagelet('pagelet1', { is: "pagelet1测试" })
  var pagelet2 = new MyPagelet('pagelet2', 'p', { t: "测试" })

  setTimeout(function(){
    bigpipe.render(pagelet1)  
  },3000);
 
  setTimeout(function(){
    bigpipe.render(pagelet2)
    // setTimeout(function(){
       bigpipe.end()  
    // },0);
  },4000);
});

app.listen(5000);

