'use strict'

const debug = require('debug')('bigview')

module.exports = class Pagelet {
  constructor () {
    if (arguments.length >= 3) {
        //(name, tpl, data) 
       this.name   = arguments[0];
       this.tpl      = arguments[1];
       this.data      = arguments[2];
     } else if (arguments.length == 2) {
       // (name, data) 
       this.name   = arguments[0];
       this.data      = arguments[1]
       this.tpl = 'index.html'
     } else {
       debug('Pagelet constructor(name, tpl, data) or constructor(name, data)')
     }
     
     this.root = '.'
     this.selector = '.xxxx'  // css
     this.location = '#main'  //location
     
     //opts
     this.lazy = false //获取fetch数据后，如果不立即渲染，则this.lazy=true，默认是立即渲染，不需要手动调用render页面

     this.options = {} // for compiler
     this.done = false

     this.delay = 0
  }

  // private only call by bigview
  // step1: fetch data
  // step2: compile(tpl + data) => html
  // step3: write html to browser
  _exec () {
    let self = this
    
    return self.fetch()
      .then(self.complile.bind(self))
      // // 获取fetch数据后，如果不立即渲染，则self.lazy=true
      // // 默认是立即渲染，不需要手动调用render页面
      // .then(self.log.bind(self))
      // .then(self.writeToBrowser.bind(self))
      // .then(self.finish.bind(self))
  }

  fetch () {
    if (this.owner.done === true) return
    console.log('Pagelet fetch')
    let self = this
    return new Promise(function(resolve, reject){
      setTimeout(function() {
        self.owner.end()
        resolve(self.data)
      }, self.delay);
    })
  }
  
  log () {
    let self = this
    return new Promise(function(resolve, reject){
      console.log('log')
      // resolve(self.data)
    })
  }

  writeToBrowser (html) {
    let self = this

    if (this.lazy === false && this.owner) {
      console.log('writeToBrowser = ')
      console.log(html)
      return self.owner.write(html)
    } else {
      return self.noopPromise()
    }
  }

  complile (tpl, data) {
    if (this.owner.done === true) return
    // if (tpl) this.tpl = tpl
    // if (data) this.data = data

    const ejs = require('ejs')
    let self = this

    return new Promise(function (resolve, reject) {
      try {
        ejs.renderFile(self.root + '/' + self.tpl, self.data, self.options, function(err, str){
            // str => Rendered HTML string
            if (err) {
              console.log(err)
              reject(err)
            }
            self.owner.write(str)
            resolve(str)
        });
      } catch (err) {
         if (err) {
            console.log(err)
            reject(err)
          }
      }    
    })
  }

  noopPromise () {
    let self = this
    return new Promise(function(resolve, reject){
      resolve(true)
    })
  }

  finish () {
    let self = this
    if (self.lazy) {
      console.log('lazy done = false, until do with api')
      return Promise.resolve(true)
    }

    return new Promise(function(resolve, reject){
      self.done = true
      resolve(true)
    }) 
  }
}


