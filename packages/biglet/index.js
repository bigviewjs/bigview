'use strict';

const debug = require('debug')('biglet');
const path = require('path');

class Pagelet {
    constructor() {
        this.data = {};
        this.tpl = 'index.html';
        this.root = '.';
        this.children = [];
        
        // payload for write to bigview.view(...)
        this.domid = 'you should add a domid'; //location
        this.css = []; // css
        this.js = []; // js
        this.html = '';// 用来缓存当前pagelet布局模板编译生成的html字符串
        this.error = undefined;

        // 为mode提供的
        this.isPageletWriteImmediately = true;
    }

    addChild(SubPagelet) {
        let subPagelet;
        // TODO: refact
        if ((SubPagelet.toString()).split('extends').length === 1) {
            subPagelet = SubPagelet
        } else {
            subPagelet = new SubPagelet()
        }

        this.children.push(subPagelet)
    }

    // private only call by bigview
    // step1: fetch data
    // step2: compile(tpl + data) => html
    // step3: write html to browser
    _exec() {
        let self = this;
        // TODO ....
        // if (this.owner && this.owner.done === true) {
        //     let err = new Error("pagelet " + this.domid + " execute after bigview.done")
        //     return Promise.reject(err)
        // }
        console.log(this.domid)
        debug('Pagelet fetch');

        // 1) this.before
        // 2）fetch，用于获取网络数据，可选
        // 3) parse，用于处理fetch获取的数据
        // 4）render，用与编译模板为html
        // 5）this.end 通知浏览器，写入完成

        return self.before()
            .then(self.fetch.bind(self))
            .then(self.parse.bind(self))
            .then(self.render.bind(self))
            .then(self.end.bind(self))
    }

    before() {
        return Promise.resolve(true)
    }

    /**
     * 用于发起网络请求获取数据
     */
    fetch() {
        return Promise.resolve(this.data)
    }
    
    /**
     * 用于对fetch获取的数据进行处理
     * 约定 return Promise.resolve(this.data = xxx)
     */
    parse() {
        return Promise.resolve(this.data)
    }

    /**
     * compile
     */
    compile(tpl, data) {
        let self = this;

        return new Promise(function (resolve, reject) {
            self.owner.res.render(tpl, data, function (err, str) {
                // str => Rendered HTML string
                if (err) {
                    console.log(err);
                    reject(err);
                }

                resolve(str);
            })
        })
    }

    render() {
        if (this.owner && this.owner.done === true) {
            console.log('no need to complet');
            return Promise.resolve(true);
        }

        let self = this;
        let tplPath = path.join(self.root + '/' + self.tpl);

        return self.compile(tplPath, self.data).then(function (str) {
            self.write(str)
            return Promise.resolve(true);
        }).catch(function (err) {
            console.error('complile' + err)
        })
    }

    end() {
        return this.renderChildren(this.children)
    }
    
    // refact name && remove pagelet
    renderChildren(pageletOrPagelets) {
        let arr = []
        if (Array.isArray(pageletOrPagelets)) {
            arr = pageletOrPagelets
        } else {
            arr.push(pageletOrPagelets)
        }

        let self = this;
        let queue = [];

        arr.forEach(function (subPagelet) {
            subPagelet.owner = self.owner;
            if (!subPagelet._exec) {
                throw new Error('you should use like this.trigger(new somePagelet()')
            }
            queue.push(subPagelet._exec())
        });

        if (queue.length === 0) {
            return Promise.resolve(true)
        }

        return Promise.all(queue).then(function (results) {
            // 如果需要可以在bigview处捕获，生成mock的数据
            self.owner.emit('pageletEnd', self)

            return [self.html].concat(results)
        })
    }

    get payload() {
        let _payload = {
            domid: this.domid,
            js: this.js,
            css: this.css,
            html: this.html, // fix by dimu.feng
            error: this.error
        }

        return JSON.stringify(_payload)
    }

    get view() {
        return `<script charset=\"utf-8\">bigview.view(${this.payload})</script>`
    }

    //event wrapper
    write(html) {
        this.html = html;
        
        // wrap html to script tag
        let view = this.view;
        
        // bigpipe write
        this.owner.emit('pageletWrite', view, this.isPageletWriteImmediately)
        // 不需要return，因为end无参数
        return view;
    }
}

module.exports = Pagelet;
