const Pagelet = require('.').Pagelet

module.exports = class MyPagelet extends Pagelet {
  renderText (data) {
    console.log(JSON.stringify(data))
    console.log('<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>')
    return '<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>'
  }

  renderTpl (data, text) {
    console.log(JSON.stringify(data))
    console.log('text=' + text)
    console.log('<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>')
    return '<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>'
  }
}
