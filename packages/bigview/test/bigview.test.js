import test from 'ava'
import BigView from '../index'
import Biglet from '../../biglet'
import ctx from '../../../test/fixtures/context'

test('test redux', async t => {
  const bigView = new BigView(ctx)

  t.is(bigView.debug, false)

  const mainBiglet = new Biglet(bigView)
  mainBiglet.name = 'mainPagelet'
  mainBiglet.domid = 'main'
  mainBiglet.reducer = (state = {}, action) => {
    switch (action.type) {
      case 'INITIAL':
        return Object.assign({}, state, action.data)
      default:
        return state
    }
  }
  mainBiglet.mainGetData = () => {
    const state = bigView.getState()
    mainBiglet._data = state[mainBiglet.name]
  }
  mainBiglet.fetch = async () => {
    mainBiglet.sub(mainBiglet.mainGetData)
    bigView.dispatch({
      type: 'INITIAL',
      data: {
        text: '测试数据'
      }
    })
  }

  bigView.main = mainBiglet

  await bigView.start()

  t.is(mainBiglet._data.text, '测试数据')
})
test('test BigView', async t => {
  const bigView = new BigView(ctx)

  t.is(bigView.debug, false)

  const mainBiglet = new Biglet(bigView)
  mainBiglet.domid = 'main'
  bigView.main = mainBiglet

  const layoutBiglet = new Biglet(bigView)
  layoutBiglet.domid = 'layout'
  layoutBiglet.root = __dirname
  layoutBiglet.tpl = './fixures/index.tpl.html'
  bigView.layout = layoutBiglet

  const childBiglet = new Biglet(bigView)
  childBiglet.domid = 'child'

  bigView.add(childBiglet)

  const errorBiglet = new Biglet(bigView)
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

  bigView.ctx.render = function (tpl, data, fn) {
    fn(true, tpl)
  }
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
