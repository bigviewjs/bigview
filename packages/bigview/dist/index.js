'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = require('debug')('bigview');
var Promise = require('bluebird');
var BigViewBase = require('bigview-base');
var Utils = require('./utils');

var renderToNodeStream = require('react-dom/server').renderToNodeStream;
var renderToStaticNodeStream = require('react-dom/server').renderToStaticNodeStream;
var lurMapCache = Utils.lurMapCache,
    toArray = Utils.toArray;

var PROMISE_RESOLVE = Promise.resolve(true);
var React = require('react');

var BigView = function (_BigViewBase) {
  _inherits(BigView, _BigViewBase);

  function BigView(ctx) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, BigView);

    var _this = _possibleConstructorReturn(this, (BigView.__proto__ || Object.getPrototypeOf(BigView)).call(this, ctx, options));

    _this.debug = process.env.BIGVIEW_DEBUG || false;

    _this.layout = options.layout;

    // main pagelet
    _this.main = options.main;

    // 存放add的pagelets，带有顺序和父子级别
    _this.beforePageLets = [];
    _this.pagelets = [];

    _this.done = false;

    // timeout = 30s
    _this.timeout = 30000;

    // 默认是pipeline并行模式，pagelets快的先渲染
    // 页面render的梳理里会有this.data.pagelets

    // 限制缓存的个数
    _this.cacheLevel = options.cacheLevel;
    if (_this.cacheLevel) {
      lurMapCache.init(options.cacheLimits || 30, _this.cacheLevel);
    }
    if (_this.query._pagelet_id) {
      _this.pageletId = _this.query._pagelet_id;
    }
    // 存放插件实例的数组
    _this.pluginArr = [];
    return _this;
  }

  _createClass(BigView, [{
    key: 'install',
    value: function install(Plugin) {
      // 可以在安装的时候添加额外的参数，因为class只能使用new的方式来调用所以手动把参数转为数组形式
      var args = toArray(arguments, 1);

      if (typeof Plugin === 'function') {
        var pluginObj = new Plugin(this, args);
        this.pluginArr.push(pluginObj);
      } else {
        Utils.error('plugin must be an class or function');
      }
    }
  }, {
    key: 'add',
    value: function add(Pagelet) {
      var pagelet = new Pagelet();

      pagelet.owner = this;
      pagelet.dataStore = this.dataStore;

      pagelet.stream = renderToStaticNodeStream(React.createElement(Pagelet, null));

      this.pagelets.push(pagelet);
    }

    // refact

  }, {
    key: 'addErrorPagelet',
    value: function addErrorPagelet(Pagelet) {
      var pagelet = this._getPageletObj(Pagelet);

      this.errorPagelet = pagelet;
    }

    /**
     * show error pagelet to Browser. only after bigview renderLayout
     * @api public;
     */

  }, {
    key: 'showErrorPagelet',
    value: function showErrorPagelet(error) {
      debug(error);
      // reset this.pagelets
      this.pagelets = this.errorPagelet ? [this.errorPagelet] : [];

      // start with render error pagelet
      return PROMISE_RESOLVE;
    }
  }, {
    key: '_checkPageletExist',
    value: function _checkPageletExist(domid) {
      // check main pagelet
      var result = this._checkPageletId(domid, this.mainPagelet);
      if (result) {
        return result;
      }
      // check added pagelets
      for (var i = 0; i < this.pagelets.length; i++) {
        var pagelet = this.pagelets[i];
        result = this._checkPageletId(domid, pagelet);
        if (result) {
          return result;
        }
      }
      return false;
    }
  }, {
    key: '_checkPageletId',
    value: function _checkPageletId(domid, pagelet) {
      if (pagelet.domid === domid) {
        return pagelet;
      }
      if (pagelet.children.length > 0) {
        for (var i = 0; i < pagelet.children.length; i++) {
          var item = pagelet.children[i];
          if (item.domid === domid) {
            return item;
          }
        }
      }
      return false;
    }
  }, {
    key: 'renderSinglePagelet',
    value: function renderSinglePagelet() {
      this._singlePagelet = this._checkPageletExist(this.pageletId);
      if (this._singlePagelet && this._singlePagelet.payload) {
        return this._modeInstance.execute([this._singlePagelet]);
      } else {
        return Promise.reject(new Error('No pagelet Found!'));
      }
    }
  }, {
    key: 'start',
    value: function start() {
      debug('BigView start');
      // 如果请求某个模块

      if (this.pageletId) {
        return this._startSinglePagelet();
      }
      // 1) this.before
      // 2）renderLayout: 渲染布局
      // 3）renderPagelets: Promise.all() 并行处理pagelets（策略是随机，fetch快的优先）
      // 4）this.end 通知浏览器，写入完成
      // 5) processError

      return this.installPlugin().then(this.before.bind(this)).then(this.beforeRenderLayout.bind(this)).then(this.renderLayout.bind(this)).then(this.afterRenderLayout.bind(this)).then(this.beforeRenderMain.bind(this)).then(this.renderMain.bind(this)).then(this.afterRenderMain.bind(this)).catch(this.showErrorPagelet.bind(this)).then(this.beforeRenderPagelets.bind(this)).then(this.renderPagelets.bind(this)).then(this.afterRenderPagelets.bind(this)).then(this.end.bind(this)).timeout(this.timeout).catch(Promise.TimeoutError, this.renderPageletstimeoutFn.bind(this)).catch(this.processError.bind(this));
    }
  }, {
    key: 'installPlugin',
    value: function installPlugin() {
      this.pluginArr.forEach(function (item) {
        if (item.install) {
          item.install();
        } else {
          Utils.log(item + ' must have a install method');
        }
      });
      return PROMISE_RESOLVE;
    }
  }, {
    key: '_getPageletObj',
    value: function _getPageletObj(Pagelet) {
      var pagelet = Pagelet;
      // if (Pagelet.domid && Pagelet.tpl) {
      //   pagelet = Pagelet
      // } else {
      //   pagelet = new Pagelet(this)
      // }

      return pagelet;
    }
  }, {
    key: '_startSinglePagelet',
    value: function _startSinglePagelet() {
      var _this2 = this;

      this.mode = 'renderdata';
      return this.before().then(function () {
        return _this2.renderMain(false);
      }).then(this.renderSinglePagelet.bind(this)).then(function () {
        _this2.res.end('');
      }).timeout(this.timeout).catch(Promise.TimeoutError, this.renderPageletstimeoutFn.bind(this)).catch(this.processError.bind(this));
    }
  }, {
    key: 'before',
    value: function before() {
      debug('default before');
      return PROMISE_RESOLVE;
    }

    /**
     * compile（tpl + data）=> html
     *
     * @api public
     */

  }, {
    key: 'compile',
    value: function compile(tpl, data) {
      var self = this;

      // set data pagelets and errorPagelet
      data.pagelets = self.pagelets || [];
      data.errorPagelet = self.errorPagelet;
      return self.render(tpl, data);
    }
  }, {
    key: 'render',
    value: function render(tpl, data, cb) {
      return PROMISE_RESOLVE;
    }
  }, {
    key: 'beforeRenderLayout',
    value: function beforeRenderLayout() {
      this.emit('beforeRenderLayout');
    }
  }, {
    key: 'renderLayout',
    value: function renderLayout() {
      var self = this;

      if (!this.layout) {
        return Promise.resolve('');
      }
      // const layoutPagelet = this.layoutPagelet = this._getPageletObj(this.layout)

      this.layoutPagelet = new this.layout();
      this.layoutPagelet.owner = this;
      this.layoutPagelet.dataStore = this.dataStore;
      this.layoutPagelet.data.pagelets = this.pagelets;

      this.layoutPagelet.stream = renderToStaticNodeStream(React.createElement(this.layout, null));

      var pageletsIDs = self.pagelets.map(function (p) {
        return p.domid;
      });
      // this.layoutPagelet.stream.on('end', () => {
      //   self.res.write(`<script>window.data = '${pageletsIDs.join(',')}'</script>`)
      // })

      this.res.write(this.layoutPagelet.stream);

      return Promise.resolve();
    }
  }, {
    key: 'afterRenderLayout',
    value: function afterRenderLayout() {
      this.emit('afterRenderLayout');
    }
  }, {
    key: 'beforeRenderMain',
    value: function beforeRenderMain() {
      this.emit('beforeRenderMain');
    }
  }, {
    key: 'renderMain',
    value: function renderMain() {
      var isWrite = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      debug('BigView renderLayoutAndMain');
      try {
        if (this.main) {
          this.mainPagelet = new this.main();
          this.mainPagelet.owner = this;
          this.mainPagelet.dataStore = this.dataStore;
          this.mainPagelet.data.pagelets = this.pagelets;
          this.mainPagelet.stream = renderToStaticNodeStream(React.createElement(this.main, null));

          return this.mainPagelet._exec(isWrite);
        } else {
          return Promise.resolve(true);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, {
    key: 'afterRenderMain',
    value: function afterRenderMain() {
      this.emit('afterRenderMain');
    }
  }, {
    key: 'beforeRenderPagelets',
    value: function beforeRenderPagelets() {
      this.emit('beforeRenderPagelets');
    }
  }, {
    key: 'renderPagelets',
    value: function renderPagelets() {
      debug('BigView  renderPagelets start');
      return this.modeInstance.execute(this.pagelets);
    }
  }, {
    key: 'afterRenderPagelets',
    value: function afterRenderPagelets() {
      this.emit('afterRenderPagelets');
    }
  }, {
    key: 'end',
    value: function end() {
      var _this3 = this;

      if (this.done) {
        return Promise.resolve();
      }

      if (this.cache.length > 0) {
        // 如果缓存this.cache里有数据，先写到浏览器，然后再结束
        // true will send right now
        var isWriteImmediately = true;
        var html = this.cache.join('');

        // 在end时，无论如何都要输出布局
        this.modeInstance.isLayoutWriteImmediately = true;

        this.write(html, isWriteImmediately);
      }

      debug('BigView end');
      var self = this;

      // lifecycle self.after before res.end
      return this.after().then(function () {
        if (_this3.layout) {
          _this3.res.end(Utils.end() + (_this3.endTagString || '\n</body>\n</html>'));
        }
        self.done = true;
        return true;
      });
    }
  }, {
    key: 'after',
    value: function after() {
      debug('default after');
      // set level 1 cache
      // this.pagelets.forEach((pagelet) => {
      //   const tpl = pagelet.tpl
      //   if (!lurMapCache.get(tpl)) {
      //     lurMapCache.set(tpl)
      //   }
      // })
      return PROMISE_RESOLVE;
    }
  }, {
    key: 'renderPageletstimeoutFn',
    value: function renderPageletstimeoutFn(err) {
      Utils.log('timeout in ' + this.timeout + ' ms');
      Utils.log(err);
      return this.end();
    }
  }, {
    key: 'layout',
    set: function set(layout) {
      this._layout = layout;
    },
    get: function get() {
      return this._layout;
    }
  }, {
    key: 'main',
    set: function set(main) {
      this._main = main;
    },
    get: function get() {
      return this._main;
    }
  }]);

  return BigView;
}(BigViewBase);

;

module.exports = BigView;