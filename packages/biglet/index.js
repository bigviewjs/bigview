'use strict';

const debug = require('debug')('biglet');
const fs = require('fs');
const path = require('path');
const PageletBase = require('./base');

class Pagelet extends PageletBase {
    constructor() {
        super();
        this.name = 'defaultname';
        this.data = {};
        this.tpl = 'index.html';
        this.root = '.';
        this.selector = 'selector'; // css
        this.location = 'location'; //location
        this.isMock = false;
        this.options = {}; // for compiler
        // this.done = false;
        this.previewFile = 'biglet.html';
        this.delay = 0;
        this.children = [];
        this.html = '';
        this.js = '';
        this.css = '';
        this.immediately = true;
        this.isPageletWriteImmediately = true;
        this.parser = 'parse.js';
        // this.display = 'block'
    }

    addChild(SubPagelet) {
        let subPagelet;
        if ((SubPagelet + '').split('extends').length === 1) {
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

        if (this.owner && this.owner.done === true) {
            return
        }

        debug('  Pagelet fetch');

        self.data.po = {};
        var arr = ['name', 'tpl', 'root', 'selector', 'location', 'options', 'delay', 'children'];

        arr.forEach(function (key) {
            self.data.po[key] = self[key]
        });

        // 1) this.before
        // 2）fetch，用于获取网络数据，可选
        // 3) parse，用于处理fetch获取的数据
        // 4）render，用与编译模板为html
        // 5）this.end 通知浏览器，写入完成

        return self.before()
        // .then(self.beforeFetch.bind(self))
            .then(self.fetch.bind(self))
            // .then(self.afterFetch.bind(self))
            // .then(self.beforeParse.bind(self))
            .then(self.parse.bind(self))
            // .then(self.afterParse.bind(self))
            // .then(self.beforeCompile.bind(self))
            .then(self.render.bind(self))
            // .then(self.afterCompile.bind(self))
            .then(self.end.bind(self))
    }

    before() {
        return Promise.resolve(true)
    }

    fetch() {
        let self = this;
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                // self.owner.end()
                resolve(self.data)
            }, self.delay)
        })
    }

    parse() {
        let pagelet = this;
        let bigview = pagelet.owner;
        let parseFile = path.join(pagelet.root, pagelet.parser);

        return new Promise(function (resolve, reject) {
            fs.open(parseFile, 'r', function (err, fd) {
                if (err) {
                    resolve(pagelet.data)
                } else {
                    require(parseFile)(pagelet, bigview).then(function (data) {
                        resolve(pagelet.data = data)
                    })
                }
            });
        })
    }

    compile(tpl, data) {
        const ejs = require('ejs');
        let self = this;

        return new Promise(function (resolve, reject) {
            ejs.renderFile(tpl, data, self.options, function (err, str) {
                // str => Rendered HTML string
                if (err) {
                    console.log(err);
                    reject(err)
                }

                resolve(str)
            })
        })
    }

    render() {
        if (this.immediately === true && this.owner && this.owner.done === true) {
            console.log('no need to complet');
            return Promise.resolve(true)
        }

        let self = this;
        let tplPath = path.join(self.root + '/' + self.tpl);

        return self.compile(tplPath, self.data).then(function (str) {
            self.html = str;
            // writeToBrowser
            if (!self.isMock) {
                self.owner.emit('pageletWrite', str, self.isPageletWriteImmediately)
            }

            return str
        }).catch(function (err) {
            console.log('complile' + err)
        })
    }

    end() {
        let self = this;
        let queue = [];

        this.children.forEach(function (subPagelet) {
            subPagelet.owner = self.owner;

            queue.push(subPagelet._exec())
        });

        return Promise.all(queue).then(function (results) {
            self.out();
            // self.done = true;

            return [self.html].concat(results)
        })
    }
}

module.exports = Pagelet;
