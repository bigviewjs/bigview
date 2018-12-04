/* global localStorage, location, XMLHttpRequest */
// debug bigview
var _bigviewDebug = (function (id, string) {
  var _startTime = new Date().getTime()
  var getTimeDiffStr = function () {
    var time = new Date().getTime()
    return '[+' + (time - _startTime) + 'ms];'
  }
  var isDebugOpen = false
  if (typeof process !== 'undefined') {
    isDebugOpen = process.env._bigview
  } else if (typeof window !== 'undefined') {
    isDebugOpen = window.localStorage && localStorage._bigview
  }
  return function (id, string) {
    if (isDebugOpen) {
      id = id || 'bigview'
      string = string || ''
      console.log('Module: ' + id + '  ' + string + '%c ' + getTimeDiffStr(), 'color: blue')
    }
  }
}())

var _isIE8 = function () {
  var msie = document.documentMode;
  if (msie < 9) {
    return true
  }
  return false
}
function _unescapeHtml (html) {
  var el = document.createElement('div')
  return html.replace(/&[#0-9a-z]+;/gi, function (enc) {
    el.innerHTML = enc
    return el.innerText 
  })
}

// ie8 polyfill
if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
}
var _errorTemplate = '<div class="bigview-error-template" style="position:relative;height:100%; text-align:center;padding-top:10px;">';
_errorTemplate += '<img style="display:inline-block;height:50px;" src="https://gw.alicdn.com/tfs/TB1iNyybgmTBuNjy1XbXXaMrVXa-100-100.png" />';
_errorTemplate += '<p>Some Errors ~</p>';
_errorTemplate += '<p><a href="javascript:;" class="js-bigview-retry" style="display:inline-block; padding:4px 12px;line-height:32px; text-decoration:none; color: blue;">Retry </a>';

var BigEvent = function () {
}

BigEvent.prototype.on = function (eventName, func) {
  this._listeners = this._listeners || {}
  this._listeners[eventName] = this._listeners[eventName] || []
  this._listeners[eventName].push(func)
}

BigEvent.prototype.off = function (eventName, func) {
  this._listeners = this._listeners || {}
  this._listeners[eventName].splice(this._listeners[eventName].indexOf(func), 1)
}

BigEvent.prototype.trigger = function (eventName) {
  this._listeners = this._listeners || {}

  var dataArgument = arguments[1] ? arguments[1] : null
  var events = this._listeners[eventName] || []
  for (var i = 0; i < events.length; i++) {
    var ev = events[i]
    if (dataArgument) {
      ev.call(this, dataArgument)
    } else {
      ev.call(this)
    }
  };
}

BigEvent.extend = function (obj) {
  var functions = [
    'on',
    'off',
    'trigger'
  ]

  for (var i = 0; i < functions.length; i++) {
    var func = functions[i]

    if (typeof obj === 'function') {
      obj.prototype[func] = BigEvent.prototype[func]
    } else {
      obj[func] = BigEvent.prototype[func]
    }
  };
}
var _jsMap = {}

// check js has finished load
var _checkJSLoadReady = function (domid) {
  if (!_jsMap[domid]) {
    return false
  }
  var jsGroup = _jsMap[domid]
  for (var i = 0; i < jsGroup.length; i++) {
    if (jsGroup[i] && !jsGroup[i].ready) {
      return false
    }
  }
  return true
}

var _setJSLoadStatus = function (src, domid) {
  var jsGroup = _jsMap[domid]
  for (var i = 0; i < jsGroup.length; i++) {
    if (jsGroup[i].src === src) {
      jsGroup[i].ready = 1
    }
  }
}

var Bigview = function () {
  var self = this
  this.endPagelets = []
  this.endScripts = []
  this.errorRetry = false
  this.on('end', function () {
    for (var i = 0; i < this.endPagelets.length; i++) {
      self.handlePayload(this.endPagelets[i])
    }
    for (var j = 0; j < this.endScripts.length; j++) {
      self.handlePayload(this.endScripts[j])
    }
  })

  this.log = function (id, str) {
    _bigviewDebug(id, str)
  }
  // payload={domid, html='',}
  this.view = function (payload) {
    self.trigger('pageletArrive', payload)
    if (payload.domid) {
      self.trigger(payload.domid, payload)
    }
  }

  this.ready = function (data) {
    self.trigger('ready', data)
  }

  this.end = function (data) {
    this.trigger('end', data)
  }

  this.error = function (payload) {
    this.trigger('error', payload)
    this.log(payload.domid, ' occurs some error!')
    // need show error template
    if (!this.errorRetry) {
      return
    }
    var el = this.replaceHtml(payload.domid, this.errorTemplate)
    var btn = el.querySelector('.js-bigview-retry')
    if (btn) {
      btn.addEventListener('click', function () {
        self._request(payload)
      })
    }
  }

  this.beforePageletArrive = function (string) {
    self.trigger('beforePageletArrive', string)
  }

  this.on('pageletArrive', function (payload) {
    if (payload.lifecycle === 'end') {
      return this.endPagelets.push(payload)
    }
    this.handlePayload(payload)
  })

  this.handlePayload = function (payload) {
    if (payload.error) {
      return self.error(payload)
    }
    self.log(payload.domid, 'pageletArrive')
    // css -> html -> js
    if (payload.css) {
      var css = Array.isArray(payload.css) ? payload.css : [payload.css]
      for (var j = 0; j < css.length; j++) {
        self.insertCss(css[j])
      }
    }
    if (payload.domid && !payload.error && typeof document === 'object') {
      self.replaceHtml(payload.domid, payload.html, payload.attr)
    }
    if (payload.js) {
      var js = Array.isArray(payload.js) ? payload.js : [payload.js]
      var jsGroup = []
      for (var i = 0; i < js.length; i++) {
        var item = js[i]
        if (_isIE8()) {
          return self.endScripts.push(item)
        }
        jsGroup.push({
          src: item,
          ready: 0
        })
        self.insertScript(item, payload)
      }
      _jsMap[payload.domid] = jsGroup
    }
  }

  this.replaceHtml = function (el, html, attrs) {
    var oldEl = document.getElementById(el)
    if (!oldEl) {
      return
    }
    var code = document.getElementById(el + '-code')
    if (html && /\/script/.test(html)) {
      html = _unescapeHtml(html)
    }
    if (code) {
      html = code.innerHTML
    }
    var newEl = oldEl.cloneNode(false)
    if (attrs && typeof attrs === 'object') {
      for (var key in attrs) {
        newEl.setAttribute(key, attrs[key])
      }
      newEl.setAttribute('modshow', 1)
    }
    if (!html) {
      return
    }
    newEl.innerHTML = html
    oldEl.parentNode.replaceChild(newEl, oldEl)
    // excute script intime
    if (_isIE8()) {
      var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
      var scriptMatch = re.exec(html)
      if (scriptMatch && scriptMatch[1]) {
        var scriptNode = document.createElement('SCRIPT')
        scriptNode.text = scriptMatch[1]
        newEl.appendChild(scriptNode)
      }
      return newEl
    }
    if (code) {
      return
    }
    var scripts = newEl.getElementsByTagName('script')
    var len = scripts.length
    for (var i = 0; i < len; i++) {
      var item = scripts[i]
      var node = document.createElement('SCRIPT')
      if (item.src) {
        node.src = item.src
        item.parentNode.replaceChild(node, item)
      } else if (item.innerText.trim()) {
        node.text = item.innerText
        item.parentNode.replaceChild(node, item)
      }
    }
    return newEl
  }

  this.insertCss = function (src) {
    var link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = src
    document.getElementsByTagName('head')[0].appendChild(link)
  }

  this.insertScript = function (src, payload) {
    if (!src) {
      return
    }
    var node = document.createElement('SCRIPT')
    node.src = src
    node.async = true
    node.onload = function () {
      _setJSLoadStatus(src, payload.domid)
      self.handleCallback(payload.callback, payload.domid)
    }
    document.body.appendChild(node)
  }

  this.handleCallback = function (fn, domid) {
    if (typeof fn === 'string') {
      fn = (new Function(fn)).bind(this)
    }
    if (typeof fn === 'function') {
      if (_checkJSLoadReady(domid)) {
        fn()
      }
    }
  }

  // requert an signle pagelet via ajax
  this._request = function (payload) {
    var url = location.href
    if (location.search) {
      url += ('&_pagelet_id=' + payload.domid)
    } else {
      url += ('?_pagelet_id=' + payload.domid)
    }
    var xhr = new XMLHttpRequest()
    // TODO jaso or html ?
    xhr.onload = function (response) {
      var data = xhr.response
      var json = {}
      try {
        json = JSON.parse(data)
      } catch (_e) {
        if (xhr.status === 401) {
          _bigviewDebug('access_denied', xhr.statusText)
        }
      }
      json.error = false
      self.view(json)
    }
    xhr.onerror = function (err) {
      self.error(payload)
      console.error(err)
    }
    xhr.open('GET', url, true)
    xhr.setRequestHeader('bigview_error_time', Date.now())
    xhr.send()
  }
}

BigEvent.extend(Bigview)

var _bigview = new Bigview()
_bigview.errorTemplate = _errorTemplate
if (typeof define === 'function' && define.amd) {
  define('bigview', [], function () {
    return _bigview
  })
} else if (typeof exports === 'object') {
  module.exports = _bigview
} else {
  window.bigview = _bigview
}