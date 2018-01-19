import test from 'ava'
import Biglet from '../index'
import ctx from '../../../test/fixtures/context'

test('test Biglet', async t => {
  const biglet = new Biglet()
  biglet.css = './a.css'
  biglet.js = './a.js'
  biglet.domid = 'a'
  biglet.owner = ctx
  t.plan(3)

  t.is(biglet.timeout, 10000)

  await biglet._exec()
  biglet.write('<div></div')

  t.is(biglet.view, '<script charset=\"utf-8\">bigview.view({\"domid\":\"a\",\"js\":\"./a.js\",\"css\":\"./a.css\",\"html\":\"tpl/index/"})</script>')

  biglet.addChild(Biglet, ctx)
  t.is(biglet.children.length, 1)

})
