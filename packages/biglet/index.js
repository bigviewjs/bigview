'use strict'

const debug = require('debug')('biglet')
const Promise = require('bluebird')
const path = require('path')
const React = require('react')
const renderToNodeStream = require('react-dom/server').renderToNodeStream

const PROMISE_RESOLVE = Promise.resolve(true)

module.exports = class Pagelet extends React.Component {
  constructor (props) {
    super(props)

    this.root = ''
    this.main = null
    this.data = {}
    this.tpl = 'tpl/index'
    this.children = []
    this.payload = {}
    // payload for write to bigview.view(...)
    this.domid = 'you should add a domid' // location
    this.css = [] // css
    this.js = [] // js
    // 用来缓存当前pagelet布局模板编译生成的html字符串
    this.html = ''
    // 写入模式  script 形式 或者 json 形式
    this.type = 'script'
    this.callback = ''
    this.error = undefined
    // timeout = 10s
    this.timeout = 10000
    // custom error function
    this.catchFn = function (err) {
      console.warn('[BIGLET domid=' + this.domid + '] : ' + err.message)
      this.error = true
      this.html = ''
      this.write()
      return PROMISE_RESOLVE
    }

    // 为mode提供的
    this.isWriteImmediately = true
  }

  sub (event) {
    if (this.owner.subscribe) {
      this.unSubscribe = this.owner.subscribe(event.bind(this))
    } else {
      // 如果没有this.owner.subscribe方法说明当前bigview没有安装redux插件或者安装失败
      console.warn('bigview is not install redux or install failed')
    }
  }

  unSub () {
    if (this.unSubscribe) {
      this.unSubscribe()
    } else {
      console.warn('bigview is not install redux or install failed')
    }
  }

  addChild (SubPagelet) {
    if (Object.prototype.toString.call(SubPagelet) === '[object Object]') {
      SubPagelet.owner = this.owner
      this.children.push(SubPagelet)
    } else {
      let subPagelet = new SubPagelet()
      subPagelet.owner = this.owner
      this.children.push(subPagelet)
    }
  }

  /*
   * execute the render
   * @param {boolean} isWrite  write data to the browsers
   * @param {string} type json | script
   * main flow: before -> fetch data -> parse data -> render template
   *  -> render children
   */
  _exec (isWrite = true, type) {
    const self = this
    debug('Pagelet ' + this.domid + ' fetch')
    if (type) self.type = type

    if (isWrite) {
      return self.before()
        .then(self.fetch.bind(self)).timeout(this.timeout)
        .then(self.parse.bind(self)).timeout(this.timeout)
        .then(self.render1.bind(self)).timeout(this.timeout)
        .then(self.renderMain.bind(self)).timeout(this.timeout)
        .then(self.renderChildren.bind(self)).timeout(this.timeout)
        .then(self.end.bind(self)).timeout(this.timeout)
        .catch(self.catchFn.bind(self))
    } else {
      return self.before()
        .then(self.fetch.bind(self)).timeout(this.timeout)
        .then(self.parse.bind(self)).timeout(this.timeout)
        .catch(self.catchFn.bind(self))
    }
  }

  before () {
    return PROMISE_RESOLVE
  }

  /**
   * 用于发起网络请求获取数据
   */
  fetch () {
    return Promise.resolve(this.data)
  }

  /**
   * 用于对fetch获取的数据进行处理
   * 约定 return Promise.resolve(this.data = xxx)
   */
  parse () {
    return Promise.resolve(this.data)
  }

  /**
   * Compile tpl + data to html
   * @private
   */
  compile (tpl, data) {
    const self = this
    return new Promise((resolve, reject) => {
      // 判断是否为模板渲染，以及 owner.render 方法是否存在
      if (tpl && data && this.owner.render) {
        self.owner.render(tpl, data, (err, str) => {
          // str => Rendered HTML string
          if (err) return reject(err)
          return resolve(str)
        })
      } else {
        return resolve(self.stream)
      }
    })
  }

  /**
   * redner template
   */
  render1 () {
    if (this.owner && this.owner.done) {
      console.warn('[BIGLET WARNING] bigview is already done, there is no need to render biglet module!')
      return PROMISE_RESOLVE
    }

    if (this.type === 'json') {
      return this.write()
    } else {
      let tplPath = this.tpl
      // 校验 tpl 路径是否为绝对路径
      const isObs = path.isAbsolute(tplPath)

      if (!isObs) {
        tplPath = path.join(this.root || __dirname, tplPath)
      }
      return this.write(this.stream)
    }
  }

  renderMain () {
    const self = this
    if (self.main) {
      const Main = self.main
      const mainPagelet = new Main()
      mainPagelet.owner = self.owner
      mainPagelet.dataStore = self.owner.dataStore
      // this.mainPagelet.data.pagelets = this.pagelets

      mainPagelet.stream = renderToNodeStream(this.main)

      mainPagelet.owner = self.owner
      if (!mainPagelet._exec) {
        throw new Error('you should use like this.trigger(new somePagelet()')
      }
      const modeInstance = self.owner.getModeInstanceWith('pipeline')
      return modeInstance.execute([mainPagelet])
    } else {
      return PROMISE_RESOLVE
    }
  }

  renderChildren () {
    const self = this

    const subPagelets = this.children
    subPagelets.forEach(function (subPagelet) {
      subPagelet.owner = self.owner
      if (!subPagelet._exec) {
        throw new Error('you should use like this.trigger(new somePagelet()')
      }
    })

    if (subPagelets.length === 0) {
      return PROMISE_RESOLVE
    }

    const modeInstance = this.owner.getModeInstanceWith(this.mode || 'pipeline')

    return modeInstance.execute(subPagelets)
  }

  end () {
    return PROMISE_RESOLVE
  }

  _getPayloadObject () {
    const attr = ['domid', 'html', 'js', 'css', 'error', 'attr', 'lifecycle', 'json', 'callback']
    for (let item of attr) {
      if (this[item]) this.payload[item] = this[item]
    }
    return this.payload
  }

  get _payload () {
    this._getPayloadObject()
    // fixed html script parse error
    return JSON.stringify(this.payload)
  }

  get view () {}

  // event wrapper
  write (html) {
    const self = this
    return new Promise((resolve, reject) => {
      // wrap html to script tag
      // const view = this.view
      // bigpipe write
      // this.owner.emit('pageletWrite', this)
      // 不需要return，因为end无参数
      const payload = self._getPayloadObject()
      // const fs = require("fs")
      // this.owner.res.write(fs.createReadStream('./package.json'))
      // this.owner.res.write(this.stream)

      if (self.type === 'json') {
        // return this._payload
        return `<script type="text/javascript">bigview.view(${self._payload})</script>\n`
      }
      let response = ''
      // response += `<script type="text/javascript">bigview.beforePageletArrive("${this.domid}")</script>\n`
      if (self.html) {
        // this.owner.res.write(`<div hidden><code id="${this.domid}-code">`)
        // this.owner.res.write(this.html)
        // this.owner.res.write(`</code></div>\n`)
        // response += `<div hidden><code id="${this.domid}-code">${this.html}</code></div>\n`
        payload.html = undefined
      }
      if (self.callback) {
        response += `<script type="text/javascript">${self.callback}</script>\n`
        payload.callback = undefined
      }
      response += `<script type="text/javascript">bigview.view(${JSON.stringify(payload)})</script>\n`
      debug(response)

      const wrapToStream = require('wrap-to-stream')
      const stream = wrapToStream(`<div hidden><code id="${self.domid}-code">`, self.stream, `</code></div>\n`)
      self.owner.res.write(stream)

      self.stream.on('end', () => {
        self.owner.res.write(response)
        return resolve(response)
      })

      self.stream.on('error', err => {
        return reject(err)
      })
    })
  }

  writeStream () {
    return this.owner.res.write(this.stream)
  }

  render () {}
}
