module.exports = class BigView {
  constructor (req, res, layout, data) {
    this.req = req
    this.res = res
    this.layout = layout
    this.data = data
    
    this.pagelets = []
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
  
  start () {
    // write layout
    return this.renderLayout()
    // prepare data
      .then(this.data)

    // catch Error
      .then(this.processError)
  }
  
  end () {
    let self = this
    setTimeout(function(){
      self.res.end()
    }, 0)
  }
  
  renderLayout () {
    let self = this
    return this.compile(self.layout, self.data)
  }
  
  loadData () {
    throw new Error('need impl')
  }
  
  processError (err) {
    // throw new Error('need impl')
  }
}
