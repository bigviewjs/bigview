'use strict'

module.exports = function (pagelet) {
    // console.log(pagelet.owner.query)
    
    pagelet.delay = 1000
    return new Promise(function(resolve, reject){
      setTimeout(function() {
        // self.owner.end()
        resolve(pagelet.data)
      }, pagelet.delay)
    }) 
}