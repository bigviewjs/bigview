'use strict'
//
// var fs = require('fs')
//
// var files = [];
// for (var i = 0; i < 100; ++i) {
//     files.push(fs.writeFileAsync("file-" + i + ".txt", "", "utf-8"));
// }
// Promise.all(files).then(function() {
//     console.log("all the files were created");
// });


class A {
  p () {
    return new Promise((resolve, reject) => {
      setTimeout( () => {
        console.log('p')
        resolve(true)
      }, 2000)
    })
  }
}

// Class B {
//
// }

var a = new A()

var q = [a.p(), a.p(), a.p()]

Promise.all(q).then(function() {
    console.log("all the files were created");
});


