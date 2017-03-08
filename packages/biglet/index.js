'use strict';

const debug = require('debug')('biglet');
const path = require('path');
const Promise = require("bluebird");

class Pagelet {
    constructor() {
        this.data = {};
        this.tpl = 'tpl/index';
        this.root = '.';
        this.children = [];
        this.payload = {};
        // payload for write to bigview.view(...)
        this.domid = 'you should add a domid'; //location
        this.css = []; // css
        this.js = []; // js
        this.html = '';// 用来缓存当前pagelet布局模板编译生成的html字符串
        this.error = undefined;
        
        // timeout = 10s
        this.timeout = 10000;
      
        // custom error function
        this.catchFn = function (err) {
            console.log("[BIGLET domid=" + this.domid + '] : ' + '\n' + err.stack)
    
            return Promise.resolve()
        }

        // 为mode提供的
        this.isPageletWriteImmediately = true;
    }

    addChild(SubPagelet) {
        let subPagelet = new SubPagelet();

        this.children.push(subPagelet)
    }

    // private only call by bigview
    // step1: fetch data
    // step2: compile(tpl + data) => html
    // step3: write html to browser
    _exec() {
        let self = this;

        debug('Pagelet ' + this.domid + ' fetch');

        // 1) this.before
        // 2）fetch，用于获取网络数据，可选
        // 3) parse，用于处理fetch获取的数据
        // 4）render，用与编译模板为html
        // 5）this.end 通知浏览器，写入完成

        return self.before()
            .then(self.fetch.bind(self)).timeout(this.timeout)
            .then(self.parse.bind(self)).timeout(this.timeout)
            .then(self.render.bind(self)).timeout(this.timeout)
            .then(self.end.bind(self)).timeout(this.timeout)
            .catch(self.catchFn.bind(self))
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
     * Compile tpl + data to html
     * 
     * @private
     */
    compile(tpl, data) {
        let self = this;

        return new Promise(function (resolve, reject) {
            self.owner.res.render(tpl, data, function (err, str) {
                // str => Rendered HTML string
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                resolve(str);
            })
        })
    }

    /**
     * Compile && Write html to bigview
     * 
     * @private
     */
    render() {
        if (this.owner && this.owner.done) {
            console.log('no need to complet');
            return Promise.resolve('');
        }

        let self = this;
        let tplPath = path.join(self.root, self.tpl);

        return self.compile(tplPath, self.data).then(function (str) {
            self.html = str
            self.write(str)
        })
    }

    end() {
        return this.renderChildren();
    }
    
    renderChildren() {
        let subPagelets = this.children;
        let self = this;

        subPagelets.forEach(function (subPagelet) {
            subPagelet.owner = self.owner;
            if (!subPagelet._exec) {
                throw new Error('you should use like this.trigger(new somePagelet()')
            }
        });

        if (subPagelets.length === 0) {
            return Promise.resolve(true)
        }

        let modeInstance = self.owner.getModeInstanceWith(this.mode || 'pipeline');
        
        return modeInstance.execute(subPagelets)
    }

    get _payload() {
        let self = this;
        
        ['domid', 'js', 'css', 'html', 'error'].forEach(function(item){
            self.payload[item] = self[item]
        })

        return JSON.stringify(self.payload)
    }

    get view() {
        return `<script charset=\"utf-8\">bigview.view(${this._payload})</script>`
    }

    //event wrapper
    write(html) {        
        // wrap html to script tag
        let view = this.view;
        
        // bigpipe write
        this.owner.emit('pageletWrite', view, this.isPageletWriteImmediately)
        // 不需要return，因为end无参数
        return view;
    }
}

module.exports = Pagelet;
