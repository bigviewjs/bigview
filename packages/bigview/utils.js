'use strict'
const fs = require('fs')
const { LRUMap } = require('lru_map')
const MODULE_ID = 'BIGVIEW'

exports.log = function (str) {
  console.log(' [' + MODULE_ID + ' LOG]: ' + str)
}

exports.error = function (str) {
  console.error(' [' + MODULE_ID + ' LOG]: ' + str)
}

// ready
// 当布局输出完成的时候，触发
exports.ready = function (isDebug) {
  if (isDebug === true) {
    return `<script charset="utf-8">bigview.debug=true;bigview.ready();</script>`
  }

  return `<script charset="utf-8">bigview.ready();</script>`
}

// end
// 当所有模块都是输出完成的时候触发
exports.end = function (data) {
  if (!data) {
    return '<script charset="utf-8">bigview.end()</script>'
  }

  return `<script charset="utf-8">bigview.end(${JSON.stringify(data)})</script>`
}

exports.lurMapCache = {
  init (limits, level) {
    if (limits && !this._lruMap) {
      this._lruMap = new LRUMap(limits)
    }
    this._level = level
  },

  set (key, val) {
    if (this._level === 1) {
      val = fs.readFileSync(key, 'utf8')
    }
    this._lruMap && this._lruMap.set(key + '_' + this._level, val)
  },

  get (key, level) {
    return this._lruMap && this._lruMap.get(key + '_' + level)
  },

  delete (key) {
    return this._lruMap.delete(key + '_' + this._level)
  },

  clear () {
    this._lruMap.clear()
    this._lruMap = null
  }
}