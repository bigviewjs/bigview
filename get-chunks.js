'use strict'

const http = require('http')
const request = require('request')
const defaultConfig = { 
  method: 'GET'
  , gzip: true
}

module.exports = function(app, path, cb, opts){
  let chunks = []
  
  http.createServer(app).listen(function() {
    let port = this.address().port
    let url = 'http://localhost:' + port + path
    defaultConfig.url = url 
    
    opts = Object.assign(defaultConfig, opts)
    
    console.log(opts.url)
    
    // 访问路径
    request(opts
    , function (error, response, body) {
        cb(chunks, error, response, body)
      }
    ).on('data', function(data) {
      // decompressed data as it is received
      // console.log('decoded chunk: ' + data)
      chunks.push(data.toString())
    })
  })
}