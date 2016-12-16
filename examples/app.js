'use strict';

var express = require('express');
var path = require('path');
var ejs = require('ejs');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', ejs.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.get('/', require('./bpmodules/basic'));

app.get('/nest',require('./bpmodules/nest'));

app.get('/nest2', require('./bpmodules/nest2'));

// app.listen(5000);
module.exports = app
