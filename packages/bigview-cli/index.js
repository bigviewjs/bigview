#!/usr/bin/env node
const fse = require('fs-extra')
var fs = require("fs")
var argv = process.argv;
argv.shift();

var file_path = __dirname;
var current_path = process.cwd();

var tpl_apply = require('tpl_apply')

for (var i = 1; i < argv.length; i++) {
  // console.log(argv[i])
  var moduleName = argv[i]
  generatePageletModule (moduleName) 
}

//
function generatePageletModule (moduleName) { 
  var p = file_path + "/tpl/pagelet"
  var files = fs.readdirSync(p)

  for(var i in files){
    var file = files[i]
    var stat = fs.statSync(p + '/' + file)

    if (stat.isDirectory()){
      console.log('copy tpl ' + current_path + '/' + moduleName + '/tpl')
      fse.copy(p + '/' + file , current_path + '/' + moduleName + '/tpl', err => {
        if (err) {
          return console.error(err)
        }
        // console.log("success!")
      });
    } else {
      gOne(file, moduleName)
    }
  }
}

function gOne(tpl, moduleName) {
  if (/^\./.test(tpl)) {
    return
  }
  // console.log(tpl)
  var mkdirp = require('mkdirp');

  var source = file_path + "/tpl/pagelet/" + tpl
  var destDir = process.cwd() + "/" + moduleName
  var dest = destDir + "/" + tpl
  
  mkdirp(destDir, function (err) {
      if (err) {
        console.error(err)
      } else {
        console.log('generate ' + dest)
      }
        
      tpl_apply.tpl_apply(source, {
        tpl: tpl,
        name: moduleName
      }, dest);
  }); 
}