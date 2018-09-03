import test from 'ava'
import BigView from '../../bigview'
import Biglet from '../../biglet'
import BigViewRedux from '../index'
import ctx from '../../../test/fixtures/context'

test('test redux', async t => {
  const bigView = new BigView(ctx)
  bigView.install(BigViewRedux)

  const mainBiglet = new Biglet()
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
