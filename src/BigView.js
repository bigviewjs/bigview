module.exports = class BigView {
  constructor (req, res, layout, data) {
    this.req = req
    this.res = res
    this.layout = layout
    this.data = data
    
    this.pagelets = []

    return this
  }

  write (data) {
    this.res.write(data)
  }
  
  compile (tpl, data) {
    let self = this
    return new Promise(function (resolve, reject) {
      console.log('renderLayout')
      self.res.render(tpl, data, function (err, str) {
        console.log(str)
        self.write(str)
        resolve(str)
      })
    })
  }
  
  render (pagelet) {
    let self = this
    this.pagelets.push(pagelet)

    let data = pagelet.data
    if (pagelet.tpl) {
      self.compile(pagelet.tpl, pagelet.data).then(function(text){
          self.write(pagelet.renderTpl(data, text))
      })
    }

    this.write(pagelet.renderText(data))
  }
  
  ready (cb = new Promise((resolve)=> resolve(true))) {
    let self = this
    // write layout
    return this.renderLayout()
      .then(this.before.bind(this))
      .then(this.processError.bind(this))
      .then(cb)
      .catch(this.processError.bind(this))
  }
  
  end (time = 0) {
    let self = this
    
    // lifecycle after
    self.after()

    setTimeout(function(){
      self.res.end()
    }, time)
  }
  
  renderLayout () {
    let self = this
    return self.compile(self.layout, self.data)
  }
  
  loadData () {
    throw new Error('need impl')
  }
  
  processError (err) {
    console.log(err)
  }

  before() {
    return new Promise(function(resolve, reject) {
      console.log('before')
      resolve(true)
    })
  }

  after() {
    console.log('after')
  }
}
