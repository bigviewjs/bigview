const debug = require('debug')('bigview')
const Promise = require('bluebird')
const BigViewBase = require('bigview-base')
const Utils = require('./utils')

const { lurMapCache, toArray } = Utils
const PROMISE_RESOLVE = Promise.resolve(true)

class BigView extends BigViewBase {
  constructor (ctx, options = {}) {
    super(ctx, options)

    this.debug = process.env.BIGVIEW_DEBUG || false

    this.layout = options.layout

    // main pagelet
    this.main = options.main

    // 存放add的pagelets，带有顺序和父子级别
    this.beforePageLets = []
    this.pagelets = []

    this.done = false

    // timeout = 30s
    this.timeout = 30000

    // 默认是pipeline并行模式，pagelets快的先渲染
    // 页面render的梳理里会有this.data.pagelets

    // 限制缓存的个数
    this.cacheLevel = options.cacheLevel
    if (this.cacheLevel) {
      lurMapCache.init(options.cacheLimits || 30, this.cacheLevel)
    }
    if (this.query._pagelet_id) {
      this.pageletId = this.query._pagelet_id
    }
    // 存放插件实例的数组
    this.pluginArr = []
  }

  install (Plugin) {
    // 可以在安装的时候添加额外的参数，因为class只能使用new的方式来调用所以手动把参数转为数组形式
    const args = toArray(arguments, 1)

    if (typeof Plugin === 'function') {
      const pluginObj = new Plugin(this, args)
      this.pluginArr.push(pluginObj)
    } else {
      Utils.error('plugin must be an class or function')
    }
  }

  set layout (layout) {
    this._layout = layout
  }

  set main (main) {
    this._main = main
  }

  get main () {
    return this._main
  }

  get layout () {
    return this._layout
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
   * @api public;
   */
  showErrorPagelet (error) {
    debug(error)
    // reset this.pagelets
    this.pagelets = this.errorPagelet ? [this.errorPagelet] : []

    // start with render error pagelet
    return PROMISE_RESOLVE
  }

  _checkPageletExist (domid) {
    // check main pagelet
    let result = this._checkPageletId(domid, this.mainPagelet)
    if (result) {
      return result
    }
    // check added pagelets
    for (let i = 0; i < this.pagelets.length; i++) {
      const pagelet = this.pagelets[i]
      result = this._checkPageletId(domid, pagelet)
      if (result) {
        return result
      }
    }
    return false
  }

  _checkPageletId (domid, pagelet) {
    if (pagelet.domid === domid) {
      return pagelet
    }
    if (pagelet.children.length > 0) {
      for (let i = 0; i < pagelet.children.length; i++) {
        const item = pagelet.children[i]
        if (item.domid === domid) {
          return item
        }
      }
    }
    return false
  }

  renderSinglePagelet () {
    this._singlePagelet = this._checkPageletExist(this.pageletId)
    if (this._singlePagelet && this._singlePagelet.payload) {
      return this._modeInstance.execute([this._singlePagelet])
    } else {
      return Promise.reject(new Error('No pagelet Found!'))
    }
  }

  start () {
    debug('BigView start')
    // 如果请求某个模块

    if (this.pageletId) {
      return this._startSinglePagelet()
    }
    // 1) this.before
    // 2）renderLayout: 渲染布局
    // 3）renderPagelets: Promise.all() 并行处理pagelets（策略是随机，fetch快的优先）
    // 4）this.end 通知浏览器，写入完成
    // 5) processError

    return this.installPlugin()
      .then(this.before.bind(this))
      .then(this.beforeRenderLayout.bind(this))
      .then(this.renderLayout.bind(this))
      .then(this.afterRenderLayout.bind(this))
      .then(this.beforeRenderMain.bind(this))
      .then(this.renderMain.bind(this))
      .then(this.afterRenderMain.bind(this))
      .catch(this.showErrorPagelet.bind(this))
      .then(this.beforeRenderPagelets.bind(this))
      .then(this.renderPagelets.bind(this))
      .then(this.afterRenderPagelets.bind(this))
      .then(this.end.bind(this))
      .timeout(this.timeout)
      .catch(Promise.TimeoutError, this.renderPageletstimeoutFn.bind(this))
      .catch(this.processError.bind(this))
  }

  installPlugin () {
    this.pluginArr.forEach(item => {
      if (item.install) {
        item.install()
      } else {
        Utils.log(`${item} must have a install method`)
      }
    })
    return PROMISE_RESOLVE
  }
  _getPageletObj (Pagelet) {
    let pagelet
    if (Pagelet.domid && Pagelet.tpl) {
      pagelet = Pagelet
    } else {
      pagelet = new Pagelet(this)
    }
    pagelet.owner = this
    pagelet.dataStore = this.dataStore

    return pagelet
  }

  _startSinglePagelet () {
    this.mode = 'renderdata'
    return this.before()
      .then(() => {
        return this.renderMain(false)
      })
      .then(this.renderSinglePagelet.bind(this))
      .then(() => {
        this.res.end('')
      })
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
    const self = this

    // set data pagelets and errorPagelet
    data.pagelets = self.pagelets || []
    data.errorPagelet = self.errorPagelet
    return self.render(tpl, data)
  }

  render (tpl, data, cb) {
    const cacheLevel2 = lurMapCache.get(tpl, 2)
    if (cacheLevel2) {
      return cb && cb(null, cacheLevel2)
    }
    const cacheLevel1 = lurMapCache.get(tpl)
    if (cacheLevel1) {
      tpl = cacheLevel1
    }
    this.ctx.render(tpl, data, function (err, html) {
      if (err) {
        return Utils.log(err)
      }
      // let html = str + Utils.ready(this.debug)
      // 在pipeline模式下会直接写layout到浏览器
      cb && cb(err, html)
      if (cacheLevel1 || cacheLevel2) {
        return
      }
      lurMapCache.set(tpl, html)
    })
  }

  beforeRenderLayout () {
    this.emit('beforeRenderLayout')
  }

  renderLayout () {
    const self = this

    if (!this.layout) {
      return Promise.resolve('')
    }
    const layoutPagelet = this.layoutPagelet = this._getPageletObj(this.layout)
    return new Promise(function (resolve, reject) {
      let tpl = layoutPagelet.tpl
      const cacheLevel2 = lurMapCache.get(tpl, 2)
      if (cacheLevel2) {
        self.write(cacheLevel2, self.modeInstance.isLayoutWriteImmediately)
        return resolve(cacheLevel2)
      }
      const cacheLevel1 = lurMapCache.get(tpl, 1)
      if (cacheLevel1) {
        debug('Use cache level 1')
        tpl = cacheLevel1
      }
      self.ctx.render(tpl, layoutPagelet.data, function (err, html) {
        if (err) {
          reject(err)
        } else {
          self.write(html, self.modeInstance.isLayoutWriteImmediately)
          resolve(html)
          if (cacheLevel1 || cacheLevel2) {
            return
          }
          lurMapCache.set(tpl, html)
        }
      })
    })
  }

  afterRenderLayout () {
    this.emit('afterRenderLayout')
  }

  beforeRenderMain () {
    this.emit('beforeRenderMain')
  }

  renderMain (isWrite = true) {
    debug('BigView renderLayoutAndMain')
    try {
      if (this.main) {
        this.mainPagelet = this._getPageletObj(this.main)
        this.mainPagelet.data.pagelets = this.pagelets
        return this.mainPagelet._exec(isWrite)
      } else {
        return Promise.resolve(true)
      }
    } catch (error) {
      console.log(error)
    }
  }
  afterRenderMain () {
    this.emit('afterRenderMain')
  }
  beforeRenderPagelets () {
    this.emit('beforeRenderPagelets')
  }
  renderPagelets () {
    debug('BigView  renderPagelets start')
    return this.modeInstance.execute(this.pagelets)
  }

  afterRenderPagelets () {
    this.emit('afterRenderPagelets')
  }

  end () {
    if (this.done) {
      return Promise.resolve()
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
    const self = this

    // lifecycle self.after before res.end
    return this.after().then(() => {
      if (this.layout) {
        this.res.end(Utils.end() + (this.endTagString || '\n</body>\n</html>'))
      }
      self.done = true
      return true
    })
  }

  after () {
    debug('default after')
    // set level 1 cache
    // this.pagelets.forEach((pagelet) => {
    //   const tpl = pagelet.tpl
    //   if (!lurMapCache.get(tpl)) {
    //     lurMapCache.set(tpl)
    //   }
    // })
    return PROMISE_RESOLVE
  }

  renderPageletstimeoutFn (err) {
    Utils.log('timeout in ' + this.timeout + ' ms')
    Utils.log(err)
    return this.end()
  }
};

module.exports = BigView
