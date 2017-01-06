'use strict';

const debug = require('debug')('biglet');
const fs = require('fs');
const path = require('path');

class Pagelet {
    constructor() {
        this.name = 'defaultname';
        this.data = {};
        this.tpl = 'index.html';
        this.root = '.';
        this.selector = 'selector'; // css
        this.location = 'location'; //location

        this.children = [];
        // 用来缓存当前pagelet布局模板编译生成的html字符串
        this.html = '';
        // 为延时渲染提供的
        this.immediately = true;
        // 为mode提供的
        this.isPageletWriteImmediately = true;
        // 在parse方法里，默认的加载文件
        this.parser = 'parse.js';
    }

    addChild(SubPagelet) {
        let subPagelet;
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

        if (this.owner && this.owner.done === true) {
            let err = new Error("pagelet " + this.name + " execute after bigview.done")
            return Promise.reject(err)
        }

        debug('Pagelet fetch');

        self.data.po = {};
        var arr = ['name', 'tpl', 'root', 'selector', 'location','children'];

        arr.forEach(function (key) {
            self.data.po[key] = self[key]
        });

        // 1) this.before
        // 2）fetch，用于获取网络数据，可选
        // 3) parse，用于处理fetch获取的数据
        // 4）render，用与编译模板为html
        // 5）this.end 通知浏览器，写入完成

        return self.before()
            .then(self.fetch.bind(self))
            .then(self.parse.bind(self))
            .then(self.render.bind(self))
            .then(self.end.bind(self));
    }

    before() {
        return Promise.resolve(true)
    }

    fetch() {
        return Promise.resolve(this.data)
    }

    parse() {
        return Promise.resolve(this.data)
    }

    renderOption() {
      return {}
    }

    compile(tpl, data) {
        const ejs = require('ejs');
        let self = this;
        let option = self.renderOption();

        return new Promise(function (resolve, reject) {
            ejs.renderFile(tpl, data, option, function (err, str) {
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
            self.owner.emit('pageletWrite', str, self.isPageletWriteImmediately)

            return str
        }).catch(function (err) {
            console.error('complile' + err)
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
            // 如果需要可以在bigview处捕获，生成mock的数据
            self.owner.emit('pageletEnd',self)
          
            return [self.html].concat(results)
        })
    }

	// lazy get value
	// if immediately === false, pagelet will not render immediately
	// so the container div should be hidden with {{display}}
	//
	// example
	//
	// {{#each pagelets}}
	//   <div id="{{ location }}" style="display:{{ display }}">loading...{{ name }}...{{ display }}</div>
	// {{/each}}
	get display() {
		return this.immediately === false ? 'none' : 'block';
	}
}

module.exports = Pagelet;
