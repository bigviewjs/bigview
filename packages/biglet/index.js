const debug = require('debug')('biglet')
const Promise = require('bluebird')
const path = require('path')
// const memwatch = require('memwatch-next');

class Pagelet {
  constructor () {
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
    this.error = undefined
    // timeout = 10s
    this.timeout = 10000

    // custom error function
    this.catchFn = function (err) {
      console.log(err)
      console.warn('[BIGLET domid=' + this.domid + '] : ' + err.message)
      this.error = true
      this.html = ''
      this.write()
      return Promise.resolve()
    }

    // 为mode提供的
    this.isPageletWriteImmediately = true
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
    if (type) {
      self.type = type
    }
    if (isWrite) {
      return self.before()
        .then(self.fetch.bind(self)).timeout(this.timeout)
        .then(self.parse.bind(self)).timeout(this.timeout)
        .then(self.render.bind(self)).timeout(this.timeout)
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
    return Promise.resolve(true)
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
    return new Promise((resolve, reject) => {
      this.owner.render(tpl, data, function (err, str) {
        // str => Rendered HTML string
        if (err) {
          return reject(err)
        }
        resolve(str)
      })
    })
  }

  /**
   * redner template
   */
  render () {
    if (this.owner && this.owner.done) {
      console.log('[BIGLET WARNING] bigview is alread done, there is no need to render biglet module!')
      return Promise.resolve()
    }

    if (this.type === 'json') {
      this.write()
    } else {
      let tplPath = this.tpl
      // 校验 tpl 路径是否为绝对路径
      const isObs = path.isAbsolute(tplPath)

      if (!isObs) {
        tplPath = path.join(this.root || __dirname, tplPath)
      }
      return this.compile(tplPath, this.data).then((str) => {
        this.html = str
        this.write(str)
      })
    }
  }

  renderMain () {
    let self = this

    if (self.main) {
      let mainPagelet = new self.main()
      mainPagelet.owner = self.owner
      if (!mainPagelet._exec) {
        return Promise.reject(new Error('you should use like this.trigger(new somePagelet()'))
      }
      let modeInstance = self.owner.getModeInstanceWith('pipeline')
      return modeInstance.execute([mainPagelet])
    } else {
      return Promise.resolve(true)
    }
  }

  renderChildren () {
    let subPagelets = this.children
    let self = this

    subPagelets.forEach(function (subPagelet) {
      subPagelet.owner = self.owner
      if (!subPagelet._exec) {
        throw new Error('you should use like this.trigger(new somePagelet()')
      }
    })

    if (subPagelets.length === 0) {
      return Promise.resolve(true)
    }

    const modeInstance = this.owner.getModeInstanceWith(this.mode || 'pipeline')

    return modeInstance.execute(subPagelets)
  }

  end () {
    return Promise.resolve(true)
  }

  get _payload () {
    const attr = ['domid', 'js', 'css', 'html', 'error', 'attr', 'lifecycle', 'json']
    attr.forEach((item) => {
      this.payload[item] = this[item]
    })
    // fixed html script parse error
    return JSON.stringify(this.payload)
  }

  get view () {
    if (this.type === 'json') {
      // return this._payload
      return `<script type="text/javascript">bigview.view(${this._payload})</script>\n`
    }
    return `<script type="text/javascript">bigview.beforePageletArrive("${this.domid}")</script>\n
<script type="text/javascript">bigview.view(${this._payload})</script>\n`
  }

  // event wrapper
  write (html) {
    // wrap html to script tag
    const view = this.view
    // bigpipe write
    this.owner.emit('pageletWrite', this)
    // 不需要return，因为end无参数
    return view
  }
}

module.exports = Pagelet
