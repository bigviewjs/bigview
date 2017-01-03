'use strict'

const debug = require('debug')('bigview')
const fs = require('fs')
global.Promise = require("bluebird")
const EventEmitter = require('events')

module.exports = class BigView extends EventEmitter {
  constructor (req, res, layout, data) {
    super()

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
    if (req.cookies) this.body = req.cookies
      
    this.on('write', this.write.bind(this));
    this.on('pageletWrite', this.pageletWrite.bind(this));
    
    return this
  }
  
  set mode (mode) {
    console.log(mode)
    // 从this.query('bigview_mode') 第一
    if (this.query.bigview_mode) {
      mode = this.query.bigview_mode
    }
    // 从this.cookies('bigview_mode') 其次
    console.log(this.cookies)
    if (this.cookies && this.cookies.bigview_mode) {
      mode = this.cookies.bigview_mode
    }
    // 用户设置第三
    if (fs.existsSync(__dirname + '/mode/' + mode + '.js') === true) {
      this._mode = mode  
    } else {
      let arr = fs.readdirSync(__dirname + '/mode')
      this._mode = 'pipeline' 
      console.log(arr)
    }

    const Mode = require('./mode/' + this._mode)
    this.modeInstance = new Mode()
    console.log(this.modeInstance)
  }

 /**
  * Write data to Browser.
  *
  * @api public
  */
  write (text, isWriteImmediately) {
    if (!text) return
    console.dir(text)
    // 是否立即写入，如果不立即写入，放到this.cache里
    if (!isWriteImmediately && this.modeInstance.isLayoutWriteImmediately === false) {
      return this.cache.push(text)
    }

    if (this.done === true) return

    let self = this

    return new Promise(function (resolve, reject) {
      debug('BigView final data = ' + text)
      debug(text)
      if (text && text.length > 0 ) {
        // save to chunks array for preview
        self.setPageletChunk(text)

        // write to Browser
        self.res.write(text)
      }
    })
  }

  /**
  * Write data to Browser.
  *
  * @api public
  */
  pageletWrite (text, isWriteImmediately) {
    if (!text) return
    console.dir(text)
    if (isWriteImmediately === false) {
      return this.cache.push(text)
    }

    if (this.done === true) return

    let self = this

    return new Promise(function (resolve, reject) {
      debug('BigView final data = ' + text)
      debug(text)
      if (text && text.length > 0 ) {
        // save to chunks array for preview
        self.setPageletChunk(text)

        // write to Browser
        self.res.write(text)
      }
    })
  }
  
  /**
   * Only for mock
   *
   * @api public
   */
  setPageletChunk (text) {
    if (this.chunks.length < 1) {
      return this.chunks.push(text)
    }

    let pagelet = this.allPagelets[this.chunks.length-1]
    debug(pagelet)

    let comment = `<!--这是${pagelet.name}-->`
    let _t =  comment + '\n' + text
    this.chunks.push(_t)
  }

  /**
   * compile（tpl + data）=> html
   *
   * @api public
   */
  compile (tpl, data) {
    let self = this
    if (!tpl) return Promise.resolve(true)
    return new Promise(function (resolve, reject) {
      debug('renderLayout')
      self.res.render(tpl, data, function (err, str) {
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

  add (Pagelet) {
    let pagelet
    // console.log((Pagelet + '').split('extends').length)
    if ((Pagelet + '').split('extends').length === 1){
      pagelet = Pagelet
    } else {
      pagelet = new Pagelet()
    }
        
    pagelet.owner = this

    let self = this
    this.pagelets.push(pagelet)

    var re = []
    // 递归实现深度遍历，这是由于pagelet有子pagelet的原因
    function getPagelets (pagelet) {
      re.push(pagelet)
      var a = []
      if (pagelet.children) {
        for(let i in pagelet.children){
          let p = pagelet.children[i]
          p.parent = pagelet.name
          re.push(p)

          if (p.children && p.children.length > 0) {
            getPagelets (p) 
          }
        }
      }
    }

    getPagelets(pagelet)

    for(let i in re) {
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
  run (pageletName) {
    let _pagelet
    for (let i in this.pagelets) {
      let pagelet = this.pagelets[i]
      if (pagelet.name === pageletName) {
        pagelet.immediately = true
      }
    }
  }
  
  beforeFetchAllData () {
    return Promise.resolve(true)
  }
  
  afterFetchAllData () {
    return Promise.resolve(true)
  }

  fetchAllData () {
    debug("BigView  fetchAllData start")
    let bigview = this

    return this.modeInstance.execute(bigview)
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
      .then(this.beforeRenderLayout.bind(this))
      .then(this.renderLayout.bind(this))
      .then(this.afterRenderLayout.bind(this))
      .then(this.beforeFetchAllData.bind(this))
      .then(this.fetchAllData.bind(this))
      .then(this.afterFetchAllData.bind(this))
      .then(this.end.bind(this))
      .catch(this.processError.bind(this))
  }
  
  end (time) {
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

    return new Promise(function (resolve, reject) {
      setTimeout(function(){
        self.res.end()
        self.done = true
        resolve(true)
      }, t)
    })
  }
  
  beforeRenderLayout () {
    return Promise.resolve(true)
  }
  
  afterRenderLayout () {
    return Promise.resolve(true)
  }
  
  renderLayout () {
    debug("BigView renderLayout")
    let self = this
    self.data = self.getData(self.data, self.pagelets)
    return self.compile(self.layout, self.data).then(function(str){
      self.layoutHtml = str
      return Promise.resolve(true)
    })
  }

  /**
  * 子类重写此方法，可以自定义
  *
  * @api public
  */

  getData (data, pagelets) {
    let self = this

    self.data.pagelets = pagelets ? pagelets : self.pagelets
    
    return self.data
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

  out () {
    if (this.isMock && this.previewFile) {
      fs.writeFileSync(this.previewFile, this.chunks.join('\n'))

      let _d = this.data
      delete _d.pagelets;

      var _a = []

      for(let i in this.allPagelets) {
        let _p = this.allPagelets[i]
        delete _p.owner
        _a.push(_p)
      }

      let d = {
        layout: this.layout,
        layoutHtml: this.layoutHtml,
        data: _d,
        // pagelets: this.pagelets,
        allPagelets: _a,
        chunks: this.chunks
      }
      
      var CircularJSON = require('circular-json')
      var str = CircularJSON.stringify(d);
      var o = JSON.parse(str)
      fs.writeFileSync(this.previewFile + '.json', JSON.stringify(d, null, 4))

    }
  }

  preview (f) {
    this.previewFile = f
  }

  after () {
    debug('default after')
    
    this.out()
  }
}
