const debug = require('debug')('biglet')
const Promise = require('bluebird')
const path = require('path')

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
    this.html = ''// 用来缓存当前pagelet布局模板编译生成的html字符串
    this.error = undefined

    // timeout = 10s
    this.timeout = 10000

    // custom error function
    this.catchFn = function (err) {
      debug(err)
      console.warn('[BIGLET domid=' + this.domid + '] : ' + err.message)
      return Promise.resolve()
    }

    // 为mode提供的
    this.isWriteImmediately = true
  }

  addChild (SubPagelet) {
    let subPagelet = new SubPagelet()

    this.children.push(subPagelet)
  }

  // private only call by bigview
  // step1: fetch data
  // step2: compile(tpl + data) => html
  // step3: write html to browser
  _exec () {
    const self = this
    debug('Pagelet ' + this.domid + ' fetch')

    // 1) this.before
    // 2）fetch，用于获取网络数据，可选
    // 3) parse，用于处理fetch获取的数据
    // 4）render，用与编译模板为html
    // 5）this.end 通知浏览器，写入完成
    return self.before()
            .then(self.fetch.bind(self)).timeout(this.timeout)
            .then(self.parse.bind(self)).timeout(this.timeout)
            .then(self.render.bind(self)).timeout(this.timeout)
            .then(self.end.bind(self)).timeout(this.timeout)
            .catch(self.catchFn.bind(self))
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
   *
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
   * Compile && Write html to bigview
   *
   * @private
   */
  render () {
    if (this.owner && this.owner.done) {
      console.log('[BIGLET WARNING] bigview is alread done, there is no need to render biglet module!')
      return Promise.resolve()
    }
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

  end () {
    return this.renderMain()
    .then(() => {
      return this.renderChildren()
    })
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

  get _payload () {
    const attr = ['domid', 'js', 'css', 'html', 'error']
    attr.forEach((item) => {
      this.payload[item] = this[item]
    })
    // fixed html script parse error
    return JSON.stringify(this.payload).replace(/\/script/g, '\\/script')
  }

  get view () {
    return `<script type="text/javascript">bigview.beforePageletArrive("${this.domid}")</script>\n
<script type="text/javascript">bigview.view(${this._payload})</script>\n`
  }

  // event wrapper
  write (html) {
    // wrap html to script tag
    const view = this.view
    // bigpipe write
    this.owner.emit('pageletWrite', view, this.isPageletWriteImmediately)
    // 不需要return，因为end无参数
    return view
  }
}

module.exports = Pagelet
