const test = require('ava')
const bigview = require('../bigview.runtime')

test('bigview runtime test', t => {
  // test bigevent extends
  t.is(typeof bigview.on === 'function', true)
  t.is(typeof bigview.trigger === 'function', true)
  let num = 0
  bigview.on('add', () => {
    num = 1
  })
  bigview.on('ready', () => {
    num = 2
  })
  bigview.on('end', () => {
    num = 3
  })
  bigview.on('beforePageletArrive', (id) => {
    t.is(id, 'tid')
  })
  bigview.trigger('add')
  t.is(num, 1)
  bigview.ready()
  t.is(num, 2)
  bigview.end()
  t.is(num, 3)
  bigview.beforePageletArrive('tid')
  bigview.view({domid: 'tid'})
  bigview.off('end')
})
