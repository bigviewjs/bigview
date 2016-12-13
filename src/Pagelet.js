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
     } else {
       debug('Pagelet constructor(name, tpl, data) or constructor(name, data)')
     }
  }
  
  renderText (data) {
    throw new Error('need impl')
  }

  renderTpl (data, text) {
    throw new Error('need impl')
  }
}
