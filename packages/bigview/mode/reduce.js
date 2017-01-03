// pagelets 4种情况
// 情况1： 随机，先完成的先写入，即pipeline模式
// 情况2： 随机，all完成之后，立即写入，即parallel模式
// 情况3： 依次，写入(当前)
// 情况4： 依次，不写入，all完成之后再写入
module.exports = class CommonMode {
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
  execute (bigview) {
    let self = bigview
    
    // let q = []
    // for(var i in self.pagelets){
    //   let _pagelet = self.pagelets[i]
    //   if (_pagelet.immediately === true) q.push(_pagelet._exec())
    // }

   return Promise.reduce(self.pagelets, (total, item, index) => {
        return item._exec()
    }, 0).then(res => {
        console.log(res);
    });
    
    return Promise.all(q)
  }
}