import test from 'ava'
import Biglet from '../index'
import ctx from '../../../test/fixtures/context'

test('test Biglet', async t => {
  const biglet = new Biglet()
  biglet.css = './a.css'
  biglet.js = './a.js'
  biglet.domid = 'a'
  biglet.owner = ctx
  biglet.render= function(){
    return (
      <div>
        <h1>Main header</h1>
      </div>
    );
  }
  t.plan(2)

  t.is(biglet.timeout, 10000)

  // await biglet._exec()
  // biglet.write('<div></div')
  // console.log(biglet.view)
  // t.is(biglet.view, '<script type="text/javascript">bigview.view({\"domid\":\"a\",\"js\":\"./a.js\",\"css\":\"./a.css\"})</script>\n')

  biglet.addChild(Biglet, ctx)
  t.is(biglet.children.length, 1)
})