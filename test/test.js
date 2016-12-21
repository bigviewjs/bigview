import test from 'ava'

const app = require('../examples/app')

const testChunks = require('testchunks')

test.cb('GET /', t => {
  testChunks(app, '/',function(chunks, error, response, body){
    t.is(chunks.length, 3)
    t.end()
  })
})

test.cb('GET /nest', t => {
  testChunks(app, '/nest',function(chunks, error, response, body){
    t.is(chunks.length, 3)
    t.end()
  })
})

test.cb('GET /nest2', t => {
  testChunks(app, '/nest2',function(chunks, error, response, body){
    t.is(chunks.length, 3)
    t.end()
  })
})
