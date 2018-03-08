const Promise = require('bluebird')

module.exports = class ReduceRenderMode {
  constructor () {
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
    let self = this

    return Promise.reduce(pagelets, (total, _pagelet, index) => {
      _pagelet.isPageletWriteImmediately = self.isPageletWriteImmediately
      return _pagelet._exec()
    }, 0)
  }
}
