module.exports = class CommonMode {
  constructor () {
    this.isLayoutWriteImmediately = true
    this.isPageletWriteImmediately = true
    
    // pagelets 4种情况
    // 情况1： 随机，先完成的先写入，适合pipeline模式
    // 情况2： 顺序，完成并写入，适合pipeline模式
    // 情况3： all完成之后，立即写入
    // 情况4： all完成之后，不写入
    this.pageletMode = 1
  }


  execute () {
    let mode = this.pageletMode

    switch (mode) {
      case 1:
        break;
      case 2:
        break;
      default:
    }
  }
  
  allsequence () {
    promise.reduce().then(function(results){
      return Promise.resolve(results)
    })
  }
  
  allRandom () {
    promise.all().each(function(results){
      return Promise.resolve(results)
    })
  }
  
  allRandom () {
    promise.all().each(function(results){
      return Promise.resolve(results)
    })
  }
  
}