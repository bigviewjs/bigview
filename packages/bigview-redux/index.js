const redux = require('redux')
const combineReducers = redux.combineReducers

class BigViewRedux {
  constructor (owner, options) {
    this.owner = owner
  }

  install () {
    this.installRedux()
  }

  installRedux () {
    const reducerObj = {}
    if (this.owner.main) {
      const mainPagelet = this.owner._getPageletObj(this.owner.main)
      if (mainPagelet.reducer) {
         // 如果有reducer方法则pagelet必须要有name属性
        if (mainPagelet.name) {
          reducerObj[mainPagelet.name] = mainPagelet.reducer
        } else {
          console.error(`mainPagelet must have a name`)
          return
        }
      }
    }
    this.owner.pagelets.map(item => {
      if (item.reducer) {
        // 如果有reducer方法则pagelet必须要有name属性
        if (item.name) {
          reducerObj[item.name] = item.reducer
        } else {
          console.error(`${item} must have a name`)
          return
        }
      }
    })
    if (Object.keys(reducerObj).length !== 0) {
      const AppReducer = combineReducers(
        reducerObj
      )
      const store = redux.createStore(AppReducer)
      this.owner.store = store
      Object.assign(this.owner, store)
    }
  }

}

module.exports = BigViewRedux
