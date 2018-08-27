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
        reducerObj[mainPagelet.name] = mainPagelet.reducer
      }
    }
    this.owner.pagelets.map(item => {
      if (item.reducer) {
        reducerObj[item.name] = item.reducer
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
