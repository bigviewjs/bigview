'use strict'

const debug = require('debug')('bigview')

const Promise = require('bluebird')

const BigViewBase = require('../bigview-base')
const Utils = require('../bigview-utils')
const PROMISE_RESOLVE = Promise.resolve(true)

class BigView extends BigViewBase {
  constructor (ctx, options = {}) {
    super(ctx, options)

    this.debug = process.env.BIGVIEW_DEBUG || false

    this._layout = options.layout

    // main pagelet
    this._main = options.main

    // 存放add的pagelets，带有顺序和父子级别
    this.pagelets = []

    this.done = false

    // timeout = 30s
    this.timeout = 30000

    // 默认是pipeline并行模式，pagelets快的先渲染
    // 页面render的梳理里会有this.data.pagelets
  }

  set layout (_layout) {
    this._layout = _layout
  }

  set main (_main) {
    this._main = _main
  }

  get main () {
    return this._main
  }

  get layout () {
    return this._layout
  }

  _getPageletObj (Pagelet) {
    let pagelet

    if (Pagelet.domid && Pagelet.root) {
      pagelet = Pagelet
    } else {
      pagelet = new Pagelet(this)
    }
    pagelet.owner = this
    pagelet.dataStore = this.dataStore

    return pagelet
  }

  add (Pagelet) {
    let pagelet = this._getPageletObj(Pagelet)
    this.pagelets.push(pagelet)
  }

  // refact
  addErrorPagelet (Pagelet) {
    let pagelet = this._getPageletObj(Pagelet)
    this.errorPagelet = pagelet
  }

  /**
   * show error pagelet to Browser. only after bigview renderLayout
   *
   * @api public;
   */
  showErrorPagelet (error) {
    debug(error)
    // reset this.pagelets
    this.pagelets = this.errorPagelet ? [this.errorPagelet] : []

    // start with render error pagelet
    this.renderPagelets()
            .then(this.end.bind(this))
            .catch(this.processError.bind(this))

    return Promise.reject(new Error('interrupt， no need to continue!'))
  }

  start () {
    debug('BigView start')

    // 1) this.before
    // 2）renderLayout: 渲染布局
    // 3）renderPagelets: Promise.all() 并行处理pagelets（策略是随机，fetch快的优先）
    // 4）this.end 通知浏览器，写入完成
    // 5) processError

    return this.before().then(this.beforeRenderLayout.bind(this))
            .then(this.renderLayout.bind(this))
            .then(this.renderMain.bind(this))
            .then(this.afterRenderLayout.bind(this))
            .catch(this.showErrorPagelet.bind(this))
            .then(this.beforeRenderPagelets.bind(this))
            .then(this.renderPagelets.bind(this))
            .then(this.afterRenderPagelets.bind(this))
            .then(this.end.bind(this))
            .timeout(this.timeout)
            .catch(Promise.TimeoutError, this.renderPageletstimeoutFn.bind(this))
            .catch(this.processError.bind(this))
  }

  before () {
    debug('default before')
    return PROMISE_RESOLVE
  }

  /**
   * compile（tpl + data）=> html
   *
   * @api public
   */
  compile (tpl, data) {
    let self = this

    // set data pagelets and errorPagelet
    data.pagelets = self.pagelets || []
    data.errorPagelet = self.errorPagelet

    return new Promise(function (resolve, reject) {
      debug('renderLayout')
      self.ctx.render(tpl, data, function (err, str) {
        if (err) {
          debug('renderLayout ' + str)
          Utils.log(err)
          return reject(err)
        }
        debug(str)
        let html = str + Utils.ready(self.debug)
        // 在pipeline模式下会直接写layout到浏览器
        self.write(html, self.modeInstance.isLayoutWriteImmediately)
        // html没用到
        resolve(html)
      })
    })
  }

  renderMain () {
    debug('BigView renderLayoutAndMain')
    let mainPagelet = null
    if (this.main) {
      mainPagelet = this._getPageletObj(this.main)
      return Promise.resolve(mainPagelet._exec())
    } else {
      return Promise.resolve(true)
    }
  }

  renderLayout () {
    const self = this
    const layoutPagelet = self._getPageletObj(self.layout)
    console.log(layoutPagelet)
    return new Promise(function (resolve, reject) {
      self.ctx.render(layoutPagelet.tpl, layoutPagelet.data, function (err, html) {
        self.write(html, self.modeInstance.isLayoutWriteImmediately)
        if (err) {
          reject(err)
        }
        resolve(html)
      })
    })
  }

  renderPagelets () {
    debug('BigView  renderPagelets start')
    return this.modeInstance.execute(this.pagelets)
  }

  end () {
    if (this.done) {
      let err = new Error('bigview.done = true')
      return Promise.reject(err)
    }

    if (this.cache.length > 0) {
      // 如果缓存this.cache里有数据，先写到浏览器，然后再结束
      // true will send right now
      let isWriteImmediately = true
      let html = this.cache.join('')

      // 在end时，无论如何都要输出布局
      this.modeInstance.isLayoutWriteImmediately = true

      this.write(html, isWriteImmediately)
    }

    debug('BigView end')

    let self = this

    // lifecycle self.after before res.end
    return self.after().then(function () {
      self.res.end(Utils.end())
      self.done = true
      return true
    })
  }

  after () {
    debug('default after')
    return PROMISE_RESOLVE
  }

  renderPageletstimeoutFn (err) {
    Utils.log('timeout in ' + this.timeout + ' ms')
    Utils.log(err)
    return this.end()
  }
};

module.exports = BigView
