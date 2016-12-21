import test from 'ava'

const app = require('./fixtures/app')

const testChunks = require('testchunks')

test.cb('GET /', t => {
  testChunks(app, '/',function(chunks, error, response, body){
    t.is(chunks.length, 3)
    t.end()
  })
})
