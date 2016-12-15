import test from 'ava'

const app = require('../app')

const http = require('http')
const request = require('request')
const testChunks = require('testchunks')


test.cb('GET /', t => {
  testChunks(app, '/',function(chunks, error, response, body){
    console.log(chunks)
    t.end()
  })
})

test.cb('GET /nest', t => {
  testChunks(app, '/nest',function(chunks, error, response, body){
    console.log(chunks.length)
    t.end()
  })
})

test.cb('GET /nest2', t => {
  testChunks(app, '/nest2',function(chunks, error, response, body){
    console.log(chunks)
    t.end()
  })
})
