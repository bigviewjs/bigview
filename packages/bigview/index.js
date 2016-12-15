'use strict'

const debug = require('debug')('bigview')

module.exports = class BigView {
  constructor (req, res, layout, data) {
    this.req = req
    this.res = res
    this.layout = layout
    this.data = data
    
    this.pagelets = []
    this.pageletActions = []
    this.done = false
    return this
  }

 /**
  * Write data to Browser.
  *
  * @api public
  */
  write (text) {
    if (this.done === true) return

    let self = this

    return new Promise(function (resolve, reject) {
      debug('BigView final data = ' + text)
      debug(text)
      if (text.length > 0 )self.res.write(text)
    })
  }
  
  compile (tpl, data) {
    let self = this
    return new Promise(function (resolve, reject) {
      debug('renderLayout')
      self.res.render(tpl, data, function (err, str) {
        debug(str)
        self.write(str)
        resolve(str)
      })
    })
  }
  
  add (pagelet) {
    pagelet.owner = this

    let self = this
    this.pagelets.push(pagelet)
  }

  fetchAllData (){
    debug("BigView  fetchAllData start")
    let self = this
    let q = []
    for(var i in self.pagelets){
      let _pagelet = self.pagelets[i]
      q.push(_pagelet._exec())
    }
    return Promise.all(q)
      // .then(function(){
      //   console.log('BigView fetchAllData end')
      // })
  }

  start () {
    debug('BigView start')
    let self = this

    // 1) this.before
    // 2）渲染布局
    // 3）Promise.all() 并行处理pagelets（策略是随机，fetch快的优先）
    // 4）this.end 通知浏览器，写入完成
  
    return this.before()
      .then(this.renderLayout.bind(this))
      .then(this.fetchAllData.bind(this))
      .then(this.end.bind(this))
      .catch(this.processError.bind(this))
  }
  
  end (time = 0) {
    if (this.done === true) return
    debug("BigView end")
    let self = this
    
    // lifecycle after
    self.after()

    return new Promise(function (resolve, reject) {
      setTimeout(function(){
        self.res.end()
        self.done = true
        resolve(true)
      }, time)
    })
  }
  
  renderLayout () {
    debug("BigView renderLayout")
    let self = this
    self.data = self.getData(self.data, self.pagelets)
    return self.compile(self.layout, self.data)
  }

  /**
  * 子类重写此方法，可以自定义
  *
  * @api public
  */

  getData (data, pagelets) {
    let self = this

    self.data.pagelets = pagelets ? pagelets : self.pagelets;
    
    return self.data
  }
  
  loadData () {
    throw new Error('need impl')
  }
  
  processError (err) {
    return new Promise(function(resolve, reject) {
      console.log(err)
      resolve(true)
    })
  }

  before () {
    return new Promise(function(resolve, reject) {
      debug('default before')
      resolve(true)
    })
  }

  after () {
    debug('default after')
  }
}
