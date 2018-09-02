const redux = require('redux')
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
    if (obj.reducer) {
      if (obj.name) {
        this.reducerObj[obj.name] = obj.reducer
      } else {
        // 如果有reducer方法则pagelet必须要有name属性
        console.error(`${JSON.stringify(obj)} use reducer must have a name`)
        return
      }
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

    if (Object.keys(this.reducerObj).length !== 0) {
      const AppReducer = combineReducers(
        this.reducerObj
      )
      const store = redux.createStore(AppReducer)
      this.owner.store = store
      Object.assign(this.owner, store)
    } else {
      console.log('no pagelet has reducer')
    }
  }

}

module.exports = BigViewRedux
