'use strict'

const Biglet = require('../../../../packages/biglet')

const Model = require('./lib/model')
const fetch = require('./lib/fetch')
const reducer = require('./lib/reducer')
const actions = require('./lib/actions')

class MainPagelet extends Biglet {
  constructor (owner) {
    super(owner)

    this.root = __dirname
    this.tpl = './index.html'
    this.name = 'main'
    this.domid = 'main'

    this.reducer = reducer
  }

  mainGetData () {
    const state = this.owner.getState()
    this._data = state[this.name]
    console.log('在main中获取redux state', state)
  }
  async fetch () {
    this.sub(this.mainGetData)
    // 网络请求获取数据
    const data = await fetch()
    // 更新main中的数据
    console.log('main获取数据')
    this.owner.dispatch(actions.initialMain(data))

    // 公共数据共享
    this.owner.dataStore.mainData = data
  }

  async parse () {
    // 模型转换
    const model = new Model(this._data)
    // 赋值data，用于模板编译
    this.data = model.toJSON()
  }
}

module.exports = MainPagelet
