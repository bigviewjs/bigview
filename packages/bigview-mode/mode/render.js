const Promise = require('bluebird')

module.exports = class RenderMode {
  constructor () {
    this.mode = 'render'
    this.isLayoutWriteImmediately = false
    this.isPageletWriteImmediately = false
  }

  /**
   * execute pagelets'action
   *
   * @param {any} bigview
   * @returns
   */
  execute (pagelets) {
    let q = []
    for (var i in pagelets) {
      let _pagelet = pagelets[i]
      _pagelet.isPageletWriteImmediately = this.isPageletWriteImmediately
      q.push(_pagelet._exec())
    }
    return Promise.all(q)
  }
}
