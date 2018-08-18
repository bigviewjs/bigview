const redux = require('redux')
const combineReducers = redux.combineReducers

class BigViewRedux {
  constructor (owner, options) {
    this.owner = owner
    this.reducerObj = {}
  }

  install () {
    this.owner.on('beforeRenderLayout', this.initRedux.bind(this))
    this.owner.on('beforeRenderMain', this.beforeRenderMain.bind(this))
    this.owner.on('beforeRenderPagelets', this.beforeRenderPagelets.bind(this))
  }

  initRedux () {
    const store = redux.createStore(() => {})
    this.owner.store = store
    Object.assign(this.owner, store)
    // console.log('store初始化成功')
  }

  beforeRenderMain () {
    if (this.owner.main) {
      const mainPagelet = this.owner._getPageletObj(this.owner.main)
      if (mainPagelet.reducer) {
        this.reducerObj[mainPagelet.name] = mainPagelet.reducer
        const AppReducer = combineReducers(
          this.reducerObj
        )
        this.owner.store.replaceReducer(AppReducer)
      }
    }
  }

  beforeRenderPagelets () {
    this.owner.pagelets.map(item => {
      if (item.reducer) {
        this.reducerObj[item.name] = item.reducer
      }
    })

    if (Object.keys(this.reducerObj).length !== 0) {
      const AppReducer = combineReducers(
        this.reducerObj
      )

      this.owner.store.replaceReducer(AppReducer)
      // console.log('store更新成功')
    }
  }
}

module.exports = BigViewRedux
