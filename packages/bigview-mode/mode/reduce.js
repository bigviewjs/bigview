const Promise = require('bluebird')

module.exports = class ReduceMode {
  constructor () {
    this.isLayoutWriteImmediately = true
    this.isPageletWriteImmediately = true
  }

  /**
   * execute pagelets'action
   *
   * @param {any} bigview
   * @returns
   */
  execute (pagelets) {
    return Promise.reduce(pagelets, (total, _pagelet, index) => {
      return _pagelet._exec()
    }, 0)
  }
}
