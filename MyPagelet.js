const Pagelet = require('.').Pagelet

module.exports = class MyPagelet extends Pagelet {
  renderText (data) {
    return '<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>'
  }

  renderTpl (data, text) {
    return '<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>'
  }
}
