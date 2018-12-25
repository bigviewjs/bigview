import test from 'ava'
import BigView from '../index'
import Biglet from '../../biglet'
import ctx from '../../../test/fixtures/context'

test('test BigView', async t => {
  const bigView = new BigView(ctx)

  t.is(bigView.debug, false)

  const mainBiglet = Biglet
  mainBiglet.domid = 'main'
  bigView.main = mainBiglet

  const layoutBiglet = Biglet
  layoutBiglet.domid = 'layout'
  layoutBiglet.root = __dirname
  // layoutBiglet.tpl = './fixures/index.tpl.html'
  layoutBiglet.render= function(){
    return (
      <div>
        <h1>Main header</h1>
      </div>
    );
  }
  bigView.layout = layoutBiglet

  const childBiglet = Biglet
  childBiglet.domid = 'child'

  bigView.add(childBiglet)

  const errorBiglet = Biglet
  errorBiglet.domid = 'error'

  bigView.addErrorPagelet(errorBiglet)

  bigView.write('data', false)

  t.is(bigView.pagelets.length, 1)

  await bigView.start()

  bigView.showErrorPagelet('error').catch(() => {
    t.is(bigView.pagelets.length, 1)
  })

  bigView.done = false
  bigView.renderPageletstimeoutFn()


  bigView.renderLayout()
    .then(() => {

    }, err => {
      t.is(err, true)
    })

  bigView.main = false
  bigView.renderMain().then(val => {
    t.is(val, true)
  })
})
