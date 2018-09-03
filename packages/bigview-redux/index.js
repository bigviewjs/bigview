const redux = require('redux')
const { log } = require('./utils')
const combineReducers = redux.combineReducers

class BigViewRedux {
  constructor (owner, options) {
    this.owner = owner
    this.reducerObj = {}
  }

  install () {
    this.installRedux()
  }

  checkReducer (obj) {
    if (obj.reducer && obj.name) {
      this.reducerObj[obj.name] = obj.reducer
    } else {
      // 如果有reducer方法则pagelet必须要有name属性
      log(`${obj.root || obj.domid} don't have reducer or name`)
    }
  }

  installRedux () {
    if (this.owner.main) {
      const mainPagelet = this.owner._getPageletObj(this.owner.main)
      this.checkReducer(mainPagelet)
    }
    this.owner.pagelets.map(item => {
      this.checkReducer(item)
    })

    if (Object.keys(this.reducerObj).length > 0) {
      // 如果有使用reducer我们才创建store
      const AppReducer = combineReducers(this.reducerObj)
      let store = redux.createStore(AppReducer)
      // 在bigview调用store api 方式 this.store.dispatch
      this.owner.store = store
      // 合并store到bigview实例 直接通过this.dispatch来调用
      Object.assign(this.owner, store)
    } else {
      log('no pagelet has reducer')
    }
  }

}

module.exports = BigViewRedux
