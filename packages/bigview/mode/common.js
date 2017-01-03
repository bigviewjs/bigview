module.exports = class CommonMode {
  constructor () {
    this.isLayoutWriteImmediately = true
    this.isPageletWriteImmediately = true
    
    // pagelets 4种情况
    // 情况1： 随机，先完成的先写入，适合pipeline模式
    // 情况2： 顺序，完成并写入，适合pipeline模式
    // 情况3： all完成之后，立即写入
    // 情况4： all完成之后，不写入
  }

  /**
   * execute pagelets'action
   * 
   * @param {any} bigview
   * @returns
   */
  execute (bigview) {
    let self = bigview
    
    let q = []
    for(var i in self.pagelets){
      let _pagelet = self.pagelets[i]
      if (_pagelet.immediately === true) q.push(_pagelet._exec())
    }
    
    return Promise.all(q)
  }
}