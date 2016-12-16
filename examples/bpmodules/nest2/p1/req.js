'use strict'

module.exports = function (pagelet) {
    pagelet.delay = 10000
    return new Promise(function(resolve, reject){
      setTimeout(function() {
        // self.owner.end()
        resolve(pagelet.data)
      }, pagelet.delay)
    }) 
}