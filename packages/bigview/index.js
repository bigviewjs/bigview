'use strict'

const debug = require('debug')('bigview')
const fs = require('fs')
global.Promise = require("bluebird")
const BigViewBase = require('./base')

module.exports = class BigView extends BigViewBase {
  constructor(req, res, layout, data) {
    super(req, res, layout, data)

    this.req = req
    this.res = res
    this.layout = layout
    this.data = data
    this.previewFile = 'bigview.html'
    this.isMock = false
    this.pagelets = []
    this.allPagelets = []
    this.done = false
    this.layoutHtml = ''
    this.cache = []
    this.chunks = []
    this.js = ''
    this.css = ''
      // 默认是pipeline并行模式，pagelets快的先渲染

    console.dir(this.modeInstance)

    if (this.req.logger) this.logger = this.req.logger

    if (req.query) this.query = req.query
    if (req.params) this.params = req.params
    if (req.body) this.body = req.body
    if (req.cookies) this.cookies = req.cookies

    this.on('write', this.write.bind(this));
    this.on('pageletWrite', this.pageletWrite.bind(this));

    if (this.query && this.query.bigview_mode) {
      this.mode = this.query.bigview_mode
    }
    // 从this.cookies('bigview_mode') 其次
    console.log("this.cookies = " + req.cookies)
    if (this.cookies && this.cookies.bigview_mode) {
      this.mode = this.cookies.bigview_mode
    }

    return this
  }

  /**
   * compile（tpl + data）=> html
   *
   * @api public
   */
  compile(tpl, data) {
    let self = this
    if (!tpl) return Promise.resolve(true)
    return new Promise(function(resolve, reject) {
      debug('renderLayout')
      self.res.render(tpl, data, function(err, str) {
        if (err) {
          debug('renderLayout ' + str)
          console.log(err)
          reject(err)
        }
        debug(str)
        self.emit('write', str)
        resolve(str)
      })
    })
  }

  add(Pagelet) {
    let pagelet
      // console.log((Pagelet + '').split('extends').length)
    if ((Pagelet + '').split('extends').length === 1) {
      pagelet = Pagelet
    } else {
      pagelet = new Pagelet()
    }

    pagelet.owner = this

    let self = this
    this.pagelets.push(pagelet)

    var re = []
      // 递归实现深度遍历，这是由于pagelet有子pagelet的原因
    function getPagelets(pagelet) {
      re.push(pagelet)
      var a = []
      if (pagelet.children) {
        for (let i in pagelet.children) {
          let p = pagelet.children[i]
          p.parent = pagelet.name
          re.push(p)

          if (p.children && p.children.length > 0) {
            getPagelets(p)
          }
        }
      }
    }

    getPagelets(pagelet)

    for (let i in re) {
      let _pagelet = re[i]
      this.allPagelets.push(_pagelet)
    }
    debug(this.allPagelets)
  }

  // when this.add(pagelet.immediately=false)
  // then only used in afterRenderLayout ()
  //
  // example
  //    afterRenderLayout () {
  //      let self = this
  //
  //      if (self.showPagelet === '1') {
  //        self.run('pagelet1')
  //      } else {
  //        self.run('pagelet2')
  //      }
  //
  //      // console.log('afterRenderLayout')
  //      return Promise.resolve(true)
  //    }
  run(pageletName) {
    let _pagelet
    for (let i in this.pagelets) {
      let pagelet = this.pagelets[i]
      if (pagelet.name === pageletName) {
        pagelet.immediately = true
      }
    }
  }

  start() {
    debug('BigView start')
    let self = this

    // 1) this.before
    // 2）渲染布局
    // 3）Promise.all() 并行处理pagelets（策略是随机，fetch快的优先）
    // 4）this.end 通知浏览器，写入完成

    return this.before()
      .then(this.beforeRenderLayout.bind(this))
      .then(this.renderLayout.bind(this))
      .then(this.afterRenderLayout.bind(this))
      .then(this.beforeFetchAllData.bind(this))
      .then(this.fetchAllData.bind(this))
      .then(this.afterFetchAllData.bind(this))
      .then(this.end.bind(this))
      .catch(this.processError.bind(this))
  }

  before() {
    return new Promise(function(resolve, reject) {
      debug('default before')
      resolve(true)
    })
  }

  renderLayout() {
    debug("BigView renderLayout")
    let self = this
    self.data = self.getData(self.data, self.pagelets)
    return self.compile(self.layout, self.data).then(function(str) {
      self.layoutHtml = str
      return Promise.resolve(true)
    })
  }

  fetchAllData() {
    debug("BigView  fetchAllData start")
    let bigview = this

    return this.modeInstance.execute(bigview)
      // .then(function(){
      //   console.log('BigView fetchAllData end')
      // })
  }

  end(time) {
    let t
    if (!time) {
      t = 0
    } else {
      t = time
    }

    if (this.done === true) return

    if (this.cache.length > 0) {
      // 如果缓存this.cache里有数据，先写到浏览器，然后再结束
      // true will send right now
      this.emit('write', this.cache.join(''), true)
    }
    debug("BigView end")
    let self = this

    // lifecycle after
    self.after()

    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        self.res.end()
        self.done = true
        resolve(true)
      }, t)
    })
  }

  after() {
    debug('default after')

    this.out()
  }
}