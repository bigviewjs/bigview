'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = require('debug')('biglet');
var Promise = require('bluebird');
var path = require('path');


module.exports = function (_React$Component) {
  _inherits(Pagelet, _React$Component);

  function Pagelet(props) {
    _classCallCheck(this, Pagelet);

    var _this = _possibleConstructorReturn(this, (Pagelet.__proto__ || Object.getPrototypeOf(Pagelet)).call(this, props));

    _this.root = '';
    _this.main = null;
    _this.data = {};
    _this.tpl = 'tpl/index';
    _this.children = [];
    _this.payload = {};
    // payload for write to bigview.view(...)
    _this.domid = 'you should add a domid'; // location
    _this.css = []; // css
    _this.js = []; // js
    // 用来缓存当前pagelet布局模板编译生成的html字符串
    _this.html = '';
    // 写入模式  script 形式 或者 json 形式
    _this.type = 'script';
    _this.callback = '';
    _this.error = undefined;
    // timeout = 10s
    _this.timeout = 10000;
    // custom error function
    _this.catchFn = function (err) {
      console.log(err);
      console.warn('[BIGLET domid=' + this.domid + '] : ' + err.message);
      this.error = true;
      this.html = '';
      this.write();
      return Promise.resolve();
    };

    // 为mode提供的
    _this.isWriteImmediately = true;
    return _this;
  }

  _createClass(Pagelet, [{
    key: 'sub',
    value: function sub(event) {
      if (this.owner.subscribe) {
        this.unSubscribe = this.owner.subscribe(event.bind(this));
      } else {
        // 如果没有this.owner.subscribe方法说明当前bigview没有安装redux插件或者安装失败
        console.warning('bigview is not install redux or install failed');
      }
    }
  }, {
    key: 'unSub',
    value: function unSub() {
      if (this.unSubscribe) {
        this.unSubscribe();
      } else {
        console.warning('bigview is not install redux or install failed');
      }
    }
  }, {
    key: 'addChild',
    value: function addChild(SubPagelet) {
      if (Object.prototype.toString.call(SubPagelet) === '[object Object]') {
        SubPagelet.owner = this.owner;
        this.children.push(SubPagelet);
      } else {
        var subPagelet = new SubPagelet();
        subPagelet.owner = this.owner;
        this.children.push(subPagelet);
      }
    }

    /*
     * execute the render
     * @param {boolean} isWrite  write data to the browsers
     * @param {string} type json | script
     * main flow: before -> fetch data -> parse data -> render template
     *  -> render children
     */

  }, {
    key: '_exec',
    value: function _exec() {
      var isWrite = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var type = arguments[1];

      var self = this;
      debug('Pagelet ' + this.domid + ' fetch');
      if (type) {
        self.type = type;
      }
      if (isWrite) {
        return self.before().then(self.fetch.bind(self)).timeout(this.timeout).then(self.parse.bind(self)).timeout(this.timeout).then(self.render1.bind(self)).timeout(this.timeout).then(self.renderMain.bind(self)).timeout(this.timeout).then(self.renderChildren.bind(self)).timeout(this.timeout).then(self.end.bind(self)).timeout(this.timeout).catch(self.catchFn.bind(self));
      } else {
        return self.before().then(self.fetch.bind(self)).timeout(this.timeout).then(self.parse.bind(self)).timeout(this.timeout).catch(self.catchFn.bind(self));
      }
    }
  }, {
    key: 'before',
    value: function before() {
      return Promise.resolve(true);
    }

    /**
     * 用于发起网络请求获取数据
     */

  }, {
    key: 'fetch',
    value: function fetch() {
      return Promise.resolve(this.data);
    }

    /**
     * 用于对fetch获取的数据进行处理
     * 约定 return Promise.resolve(this.data = xxx)
     */

  }, {
    key: 'parse',
    value: function parse() {
      return Promise.resolve(this.data);
    }

    /**
     * Compile tpl + data to html
     * @private
     */

  }, {
    key: 'compile',
    value: function compile(tpl, data) {
      var that = this;
      return new Promise(function (resolve, reject) {
        // that.owner.render(tpl, data, function (err, str) {
        //   // str => Rendered HTML string
        //   if (err) {
        //     return reject(err)
        //   }
        //   resolve(str)
        // })
        resolve(that.stream);
      });
    }

    /**
     * redner template
     */

  }, {
    key: 'render1',
    value: function render1() {
      var _this2 = this;

      if (this.owner && this.owner.done) {
        console.log('[BIGLET WARNING] bigview is alread done, there is no need to render biglet module!');
        return Promise.resolve();
      }

      if (this.type === 'json') {
        this.write();
      } else {
        var tplPath = this.tpl;
        // 校验 tpl 路径是否为绝对路径
        var isObs = path.isAbsolute(tplPath);

        if (!isObs) {
          tplPath = path.join(this.root || __dirname, tplPath);
        }
        return this.compile(tplPath, this.data).then(function (str) {
          _this2.html = str;
          _this2.write(str);
        });
      }
    }
  }, {
    key: 'renderMain',
    value: function renderMain() {
      var self = this;
      if (self.main) {
        var Main = self.main;
        var mainPagelet = new Main();
        mainPagelet.owner = self.owner;
        mainPagelet.dataStore = self.owner.dataStore;
        // this.mainPagelet.data.pagelets = this.pagelets

        mainPagelet.stream = (0, _server.renderToNodeStream)(this.main);

        mainPagelet.owner = self.owner;
        if (!mainPagelet._exec) {
          return Promise.reject(new Error('you should use like this.trigger(new somePagelet()'));
        }
        var modeInstance = self.owner.getModeInstanceWith('pipeline');

        return modeInstance.execute([mainPagelet]);
      } else {
        return Promise.resolve(true);
      }
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren() {
      var subPagelets = this.children;
      var self = this;

      subPagelets.forEach(function (subPagelet) {
        subPagelet.owner = self.owner;
        if (!subPagelet._exec) {
          throw new Error('you should use like this.trigger(new somePagelet()');
        }
      });

      if (subPagelets.length === 0) {
        return Promise.resolve(true);
      }

      var modeInstance = this.owner.getModeInstanceWith(this.mode || 'pipeline');

      return modeInstance.execute(subPagelets);
    }
  }, {
    key: 'end',
    value: function end() {
      return Promise.resolve(true);
    }
  }, {
    key: '_getPayloadObject',
    value: function _getPayloadObject() {
      var _this3 = this;

      var attr = ['domid', 'html', 'js', 'css', 'error', 'attr', 'lifecycle', 'json', 'callback'];
      attr.forEach(function (item) {
        if (_this3[item]) {
          _this3.payload[item] = _this3[item];
        }
      });
      return this.payload;
    }
  }, {
    key: 'write',


    // event wrapper
    value: function write(html) {
      // wrap html to script tag
      var view = this.view;
      // bigpipe write
      // this.owner.emit('pageletWrite', this)
      // 不需要return，因为end无参数
      return view;
    }
  }, {
    key: 'render',
    value: function render() {
      return;
    }
  }, {
    key: '_payload',
    get: function get() {
      this._getPayloadObject();
      // fixed html script parse error
      return JSON.stringify(this.payload);
    }
  }, {
    key: 'view',
    get: function get() {
      var _this4 = this;

      var payload = this._getPayloadObject();
      // const fs = require("fs")
      // this.owner.res.write(fs.createReadStream('./package.json'))
      // this.owner.res.write(this.stream)

      if (this.type === 'json') {
        // return this._payload
        return '<script type="text/javascript">bigview.view(' + this._payload + ')</script>\n';
      }
      var response = '';
      // response += `<script type="text/javascript">bigview.beforePageletArrive("${this.domid}")</script>\n`
      if (this.html) {
        // this.owner.res.write(`<div hidden><code id="${this.domid}-code">`)
        // this.owner.res.write(this.html)
        // this.owner.res.write(`</code></div>\n`)
        // response += `<div hidden><code id="${this.domid}-code">${this.html}</code></div>\n`
        payload.html = undefined;
      }
      if (this.callback) {
        response += '<script type="text/javascript">' + this.callback + '</script>\n';
        payload.callback = undefined;
      }
      response += '<script type="text/javascript">bigview.view(' + JSON.stringify(payload) + ')</script>\n';
      var strToStream = require('string-to-stream');
      debug(response);
      var wrapToStream = require('wrap-to-stream');
      var stream = wrapToStream('<div hidden><code id="' + this.domid + '-code">', this.html, '</code></div>\n');
      this.owner.res.write(stream);

      stream.on('end', function () {
        _this4.owner.res.write(response);
      });
      return response;
    }
  }]);

  return Pagelet;
}(_react2.default.Component);