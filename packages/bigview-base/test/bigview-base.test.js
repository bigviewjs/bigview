import test from 'ava'
import BigViewBase from '../index'
import ctx from '../../../test/fixtures/context'

test('test BigViewBase', t => {
  const bigView = new BigViewBase(ctx, './fixures/index.tpl', {
    num: 1
  })
  t.is(bigView.query.search, 'hello')

  bigView.dataStore = {
    str: 'test'
  }
  t.is(bigView.dataStore.str, 'test')

  t.is(bigView.body, '')
  t.is(bigView.params.q, 1)
  t.is(bigView.cookies, 'vid=101010100xml==')

  bigView.mode = 'test'
  bigView.mode = 'reduce'

  t.is(bigView.mode, 'reduce')
  t.is(bigView.modeInstance.constructor.name, 'ReduceMode')

  t.is(!bigView.getModeInstanceWith('test'), true)

  bigView.write('data', false)

  t.is(bigView.cache[0], 'data')

  bigView.write('data', true)

  // lifecycle
  bigView.beforeRenderPagelets().then((val) => {
    t.is(val, true)
  })
  bigView.afterRenderPagelets().then((val) => {
    t.is(val, true)
  })
  bigView.beforeRenderLayout().then((val) => {
    t.is(val, true)
  })
  bigView.afterRenderLayout().then((val) => {
    t.is(val, true)
  })
  bigView.processError('').then((val) => {
    t.is(val, true)
  })

  t.pass()

})
