'use strict';

const debug = require('debug')('bigview');
const BigViewBase = require('./base');

module.exports = class BigView extends BigViewBase {
    constructor(req, res, layout, data) {
        super(req, res, layout, data);

        this.req = req;
        this.res = res;
        this.layout = layout;
        this.data = data;
        this.previewFile = 'bigview.html';
        this.isMock = false;
        this.pagelets = [];
        this.allPagelets = [];
        this.done = false;
        this.layoutHtml = '';
        this.cache = [];
        this.chunks = [];
        this.js = '';
        this.css = '';
        // 默认是pipeline并行模式，pagelets快的先渲染
        // 如果是动态布局，会有this.data.pagelets
        this.isDynamicLayout = true

        debug(this.modeInstance);

        if (this.req.logger) {
            this.logger = this.req.logger
        }

        if (req.query) {
            this.query = req.query
        }

        if (req.params) {
            this.params = req.params
        }

        if (req.body) {
            this.body = req.body
        }

        if (req.cookies) {
            this.cookies = req.cookies
        }

        this.on('write', this.write.bind(this));
        this.on('pageletWrite', this.pageletWrite.bind(this));

        if (this.query && this.query.bigview_mode) {
            this.mode = this.query.bigview_mode
        }
        // 从this.cookies('bigview_mode') 其次
        // debug("this.cookies = " + req.cookies)
        if (this.cookies && this.cookies.bigview_mode) {
            this.mode = this.cookies.bigview_mode
        }

        return this
    }

    add(Pagelet) {
        let pagelet;
        // console.log((Pagelet + '').split('extends').length)
        if ((Pagelet + '').split('extends').length === 1) {
            pagelet = Pagelet
        } else {
            pagelet = new Pagelet()
        }

        pagelet.owner = this;

        this.pagelets.push(pagelet);

        let re = [];

        // 递归实现深度遍历，这是由于pagelet有子pagelet的原因
        function getPagelets(pagelet) {
            re.push(pagelet);

            if (pagelet.children) {
                pagelet.children.forEach(function (child) {
                    child.parent = pagelet.name;
                    re.push(child);

                    if (child.children && child.children.length > 0) {
                        getPagelets(child)
                    }
                });
            }
        }

        getPagelets(pagelet);

        this.allPagelets = this.allPagelets.concat(re);

        debug(this.allPagelets)
    }

    // when this.add(pagelet.immediately=false)
    // then only used in afterRenderLayout ()
    //
    // example
    //    afterRenderLayout () {
    //      let self = this
    //
    //      if (self.showPagelet === '1') {
    //        self.run('pagelet1')
    //      } else {
    //        self.run('pagelet2')
    //      }
    //
    //      // console.log('afterRenderLayout')
    //      return Promise.resolve(true)
    //    }
    run(pageletName) {
        this.pagelets.forEach(function (pagelet) {
            if (pagelet.name === pageletName) {
                pagelet.immediately = true
            }
        })
    }

    start() {
        debug('BigView start');

        // 1) this.before
        // 2）renderLayout: 渲染布局
        // 3）renderPagelets: Promise.all() 并行处理pagelets（策略是随机，fetch快的优先）
        // 4）this.end 通知浏览器，写入完成
        // 5) processError

        return this.before()
            .then(this.beforeRenderLayout.bind(this))
            .then(this.renderLayout.bind(this))
            .then(this.afterRenderLayout.bind(this))
            .then(this.beforeRenderPagelets.bind(this))
            .then(this.renderPagelets.bind(this))
            .then(this.afterRenderPagelets.bind(this))
            .then(this.end.bind(this))
            .catch(this.processError.bind(this))
    }

    before() {
        return new Promise(function (resolve, reject) {
            debug('default before');
            resolve(true)
        })
    }

    /**
     * compile（tpl + data）=> html
     *
     * @api public
     */
    compile(tpl, data) {
        let self = this;
        if (!tpl) {
            return Promise.resolve(true)
        }

        return new Promise(function (resolve, reject) {
            debug('renderLayout');
            self.res.render(tpl, data, function (err, str) {
                if (err) {
                    debug('renderLayout ' + str);
                    console.log(err);
                    reject(err)
                }
                debug(str);
                self.emit('write', str);
                resolve(str)
            })
        })
    }

    renderLayout() {
        debug("BigView renderLayout");

        // 动态布局
        if (this.isDynamicLayout) {
            this.data.pagelets = this.pagelets;
        }

        let self = this;

        return self.compile(self.layout, self.data).then(function (str) {
            self.layoutHtml = str;
            return str
        })
    }

    renderPagelets() {
        debug("BigView  renderPagelets start");
        let bigview = this;

        return this.modeInstance.execute(bigview)
    }

    end(time) {
        let t;
        if (!time) {
            t = 0
        } else {
            t = time
        }

        if (this.done === true) return;

        if (this.cache.length > 0) {
            // 如果缓存this.cache里有数据，先写到浏览器，然后再结束
            // true will send right now
            this.emit('write', this.cache.join(''), true)
        }
        debug("BigView end");
        let self = this;

        // lifecycle after
        self.after();

        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                self.res.end();
                self.done = true;
                resolve(true)
            }, t)
        })
    }

    after() {
        debug('default after');

        this.out()
    }
};