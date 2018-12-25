import test from 'ava'
import BigView from '../../bigview'
import Biglet from '../../biglet'
import BigViewRedux from '../index'
import ctx from '../../../test/fixtures/context'

test('test redux', async t => {
  const bigView = new BigView(ctx)
  bigView.install(BigViewRedux)

  class Main extends Biglet{
    constructor(props) {
      super(props)
      this.root = __dirname
      this.name = 'main biglet'
      this.data = {
        is: 'main biglet',
        po: {
          name: this.name
        }
      }
      this.domid = 'main'
      this.tpl = './tpl/index'
      this.delay = 100

    }

    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    }
  
    render() {
      return (
        <div>
          <h1>Main header</h1>
        </div>
      );
    }

    reducer (state = {}, action) {
      switch (action.type) {
        case 'INITIAL':
          return Object.assign({}, state, action.data)
        default:
          return state
      }
    }

    mainGetData ()  {
      const state = bigView.getState()
      this._data = state[this.name]
    }

    fetch () {
      this.sub(this.mainGetData)
      bigView.dispatch({
        type: 'INITIAL',
        data: {
          text: '测试数据'
        }
      })
    }
  }

  // bigView.main = Main

  // await bigView.start()
  // console.log(bigView._main._data.text)
  // t.is(bigView._main._data.text, '测试数据')
})
