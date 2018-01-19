import test from 'ava'
import BigView from '../../bigview'
import Biglet from '../../biglet'
import ctx from '../../../test/fixtures/context'

/**
 * 一次渲染模式render：即普通模式，不写入布局，所有pagelet执行完成，一次写入到浏览器。支持搜索引擎，用来支持那些不支持JS的客户端。(当前)
 *
 * 检查点：
 *
 *  - 1) 写入模块，检查cache为空
 *  - 2）检查p1和p2的顺序
 */

test('MODE render', t => {

  const bigview = new BigView(ctx, 'tpl', {})
  bigview.mode = 'parallel'

  let result = []

  var p1 = new Biglet()
  p1.owner = bigview
  p1.fetch = function () {
    return sleep(3000).then(() => {
      // console.log('p1')
      result.push('p1')
    })
  }

  p1.parse = function () {

    t.is(bigview.cache.length, 0)

    return Promise.reject(new Error('p1 reject'))
  }

  var p2 = new Biglet()
  p2.owner = bigview
  p2.fetch = function () {
    return sleep(1000).then(() => {
      // console.log('p2')
      result.push('p2')
    })
  }

  p2.parse = function () {
    t.is(bigview.cache.length, 0)

    return Promise.reject(new Error('p2 reject'))
  }

  let pagelets = [p1, p2]

  let startTime = new Date()

  return bigview.getModeInstanceWith('render').execute(pagelets).then(function(){
    let endTime = new Date()

    let cost = endTime.getTime() - startTime.getTime()
    t.true(cost > 3000)

    // 按照push顺序算的
    t.is(result[0], 'p2')
    t.is(result[1], 'p1')
  })
})

function sleep(time) {
    return new Promise((resolve)=> setTimeout(resolve, time))
}
