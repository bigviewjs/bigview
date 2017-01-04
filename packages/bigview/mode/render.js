// pagelets 4种情况
// 情况1： 随机，先完成的先写入，即pipeline模式
// 情况2： 随机，all完成之后，立即写入，即parallel模式
// 情况3： 依次，写入
// 情况4： 依次，不写入，all完成之后再写入(当前)
module.exports = class RenderMode {
  constructor() {
    this.isLayoutWriteImmediately = false
    this.isPageletWriteImmediately = false
  }

  /**
   * execute pagelets'action
   * 
   * @param {any} bigview
   * @returns
   */
  execute(bigview) {
    let q = []
    for (var i in bigview.pagelets) {
      let _pagelet = bigview.pagelets[i]
      _pagelet.isPageletWriteImmediately = this.isPageletWriteImmediately
      if (_pagelet.immediately === true) q.push(_pagelet._exec())
    }
    // parallel then render
    return Promise.all(q).then(function(results) {
      let arr = []
      results.forEach(function(i) {
        i.forEach(function(j) {
          arr.push(j)
        })
      })
      return Promise.resolve(arr)
    })
  }
}
