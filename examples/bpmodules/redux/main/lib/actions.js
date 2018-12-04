/*
 * action 类型
 */

const INITIAL = 'initial'

/*
 * action 创建函数
 */

function initialMain (data) {
  return { type: INITIAL, data }
}

module.exports = {
  INITIAL,
  initialMain
}
