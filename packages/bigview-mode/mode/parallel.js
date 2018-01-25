const Promise = require('bluebird')

module.exports = class ParallelMode {
  constructor () {
    this.isLayoutWriteImmediately = true
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
    let self = this

    pagelets.forEach(function (_pagelet) {
      _pagelet.isPageletWriteImmediately = self.isPageletWriteImmediately
      q.push(_pagelet._exec())
    })

    return Promise.all(q)
  }
}
