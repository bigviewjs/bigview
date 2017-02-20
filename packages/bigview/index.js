'use strict';

const debug = require('debug')('bigview');
const Promise = require("bluebird");
const BigViewBase = require('./base');
const Utils = require('./utils');
const PROMISE_RESOLVE = Promise.resolve(true);

class BigView extends BigViewBase {
    constructor(req, res, layout, data) {
        super(req, res, layout, data);

        this.req = req;
        this.res = res;
        this.layout = layout;

        // 用于为页面模板提供数据
        // 如果是动态布局会自动注入pagelets
        this.data = data || {};

        // 存放add的pagelets，带有父子级别的
        this.pagelets = [];

        this.done = false;
        this.layoutHtml = '';
        
        // timeout = 30s
        this.timeout = 30000;

        // 默认是pipeline并行模式，pagelets快的先渲染
        // 如果是动态布局，会有this.data.pagelets
        this.isDynamicLayout = true;
    }

    _getPageletObj(Pagelet) {
        let pagelet = new Pagelet();

        pagelet.owner = this;
        pagelet.dataStore = this.dataStore;

        return pagelet;
    }

    add(Pagelet) {
        let pagelet = this._getPageletObj(Pagelet);
        this.pagelets.push(pagelet);
    }

    // refact
    addErrorPagelet(Pagelet) {
        let pagelet = this._getPageletObj(Pagelet);
        this.errorPagelet = pagelet;
    }

    /**
     * show error pagelet to Browser. only after bigview renderLayout
     *
     * @api public;
     */
    showErrorPagelet(error) {
        debug(error);
        // reset this.pagelets
        this.pagelets = [this.errorPagelet];

        // start with render error pagelet
        this.renderPagelets()
            .then(this.end.bind(this))
            .catch(this.processError.bind(this))

        return Promise.reject(new Error('interrupt， no need to continue!'))
    }

    start() {
        debug('BigView start');
        let self = this;

        // 1) this.before
        // 2）renderLayout: 渲染布局
        // 3）renderPagelets: Promise.all() 并行处理pagelets（策略是随机，fetch快的优先）
        // 4）this.end 通知浏览器，写入完成
        // 5) processError

        return this.before()
            .then(this.beforeRenderLayout.bind(this))
            .then(this.renderLayout.bind(this))
            .then(this.afterRenderLayout.bind(this))
            .catch(this.showErrorPagelet.bind(this))
            .then(this.beforeRenderPagelets.bind(this))
            .then(this.renderPagelets.bind(this))
            .then(this.afterRenderPagelets.bind(this))
            .then(this.end.bind(this))
                .timeout(this.timeout)
                .catch(Promise.TimeoutError, this.renderPageletstimeoutFn.bind(this))
            .catch(this.processError.bind(this))
    }
    
    before() {
        debug('default before');
        return PROMISE_RESOLVE;
    }

    /**
     * compile（tpl + data）=> html
     *
     * @api public
     */
    compile(tpl, data) {
        let self = this;

        return new Promise(function(resolve, reject) {
            debug('renderLayout');
            self.res.render(tpl, data, function(err, str) {
                if (err) {
                    debug('renderLayout ' + str);
                    console.log(err);
                    return reject(err)
                }
                debug(str);
                let html = str + Utils.ready(self.debug)
                self.emit('bigviewWrite', html, true);
                resolve(html)
            })
        })
    }

    renderLayout() {
        debug("BigView renderLayout");

        // 动态布局
        if (this.isDynamicLayout) {
            this.data.pagelets = this.pagelets;
            this.data.errorPagelet = this.errorPagelet;
        }

        let self = this;

        return self.compile(self.layout, self.data).then(function(str) {
            self.layoutHtml = str;
            return str;
        })
    }

    renderPagelets() {
        debug("BigView  renderPagelets start");
        let bigview = this;
        return this.modeInstance.execute(bigview)
    }

    end() {
        if (this.done === true) {
            let err = new Error("bigview.done = true");
            return Promise.reject(err);
        }

        if (this.cache.length > 0) {
            // 如果缓存this.cache里有数据，先写到浏览器，然后再结束
            // true will send right now
            let isWriteImmediately = true;
            let html = this.cache.join('');
            this.emit('bigviewWrite', html, isWriteImmediately)
        }

        debug("BigView end");

        let self = this;

        // lifecycle self.after before res.end
        return self.after().then(function() {
            self.res.end(Utils.end());
            return self.done = true;
        });
    }

    after() {
        debug('default after');
        return PROMISE_RESOLVE;
    }
    
    renderPageletstimeoutFn(err) {
        console.log('[BIGVIEW] timeout in ' + this.timeout + ' ms')
        console.log(err)
        return this.end()
    }
};

module.exports = BigView;
