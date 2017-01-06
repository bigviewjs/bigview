'use strict';

const debug = require('debug')('bigview');
const BigViewBase = require('./base');

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
        
        // 存放所有的pagelets，无父子级别的
        this.allPagelets = [];
        this.done = false;
        this.layoutHtml = '';
        
        // 用于缓存res.write的内容
        this.cache = [];
        
        // 默认是pipeline并行模式，pagelets快的先渲染
        // 如果是动态布局，会有this.data.pagelets
        this.isDynamicLayout = true;

        this.on('write', this.write.bind(this));
        this.on('pageletWrite', this.pageletWrite.bind(this));
    }

    add(Pagelet) {
        let pagelet, re = [];

        if ((Pagelet.toString()).split('extends').length === 1) {
            pagelet = Pagelet
        } else {
            pagelet = new Pagelet()
        }

        pagelet.owner = this;

        this.pagelets.push(pagelet);

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

        debug('bigview allPagelets = ' + this.allPagelets)
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
        debug('default before');
        return Promise.resolve();
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

        return this.modeInstance.execute(bigview);
    }

    end() {
        if (this.done === true) {
            let err = new Error("bigview.done = true");
            return Promise.reject(err);
        }

        if (this.cache.length > 0) {
            // 如果缓存this.cache里有数据，先写到浏览器，然后再结束
            // true will send right now
            let isWriteImmediately  = true;
            this.emit('write', this.cache.join(''), isWriteImmediately)
        }

        debug("BigView end");

        let self = this;

        // lifecycle self.after before res.end
        return self.after().then(function () {
            self.res.end();
            return self.done = true;
        });
    }

    after() {
        debug('default after');
        return Promise.resolve();
    }
};

module.exports = BigView;
