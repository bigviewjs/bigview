'use strict';

const debug = require('debug')('bigview');
const fs = require('fs');
global.Promise = require("bluebird");
const EventEmitter = require('events');

module.exports = class BigViewBase extends EventEmitter {
    constructor(req, res, layout, data) {
        super();
    }

    set mode(mode) {
        debug(mode);
        // 从this.query('bigview_mode') 第一
        if (!mode) mode = 'pipline';

        // 用户设置第三
        if (fs.existsSync(__dirname + '/mode/' + mode + '.js') === true) {
            this._mode = mode;
        } else {
            this._mode = 'pipeline';
        }
    }

    get mode() {
        return this._mode;
    }

    get modeInstance() {
        if (!this.mode) {
            this.mode = 'pipline';
        }
        const Mode = require(__dirname + '/mode/' + this.mode);
        this._modeInstance = new Mode();
        debug(this._modeInstance);
        return this._modeInstance;
    }

    /**
     * Write data to Browser.
     *
     * @api public;
     */
    write(text, isWriteImmediately) {
        if (!text) return;
        debug(text);
        // 是否立即写入，如果不立即写入，放到this.cache里
        if (!isWriteImmediately && this.modeInstance.isLayoutWriteImmediately === false) {
            return this.cache.push(text);
        }

        if (this.done === true) return;

        debug('BigView final data = ' + text);
        debug(text);
        if (text && text.length > 0) {
            // save to chunks array for preview;
            this.setPageletChunk(text);

            // write to Browser;
            this.res.write(text);
        }
    }

    /**
     * Write data to Browser.
     *
     * @api public
     */
    pageletWrite(text, isWriteImmediately) {
        if (!text) return;
        debug(text);
        if (isWriteImmediately === false) {
            return this.cache.push(text);
        }

        if (this.done === true) return;

        debug('BigView final data = ' + text);
        debug(text);
        if (text && text.length > 0) {
            // save to chunks array for preview;
            this.setPageletChunk(text);

            // write to Browser;
            this.res.write(text);
        }
    }

    /**
     * Only for mock
     *
     * @api public
     */
    setPageletChunk(text) {
        if (this.chunks.length < 1) {
            return this.chunks.push(text);
        }

        let pagelet = this.allPagelets[this.chunks.length - 1];
        debug(pagelet);

        let comment = `<!--这是${pagelet.name}-->`;
        let _t = comment + '\n' + text;
        this.chunks.push(_t);
    }

    /**
     * 子类重写此方法，可以自定义
     *
     * @api public
     */
    getData(data, pagelets) {
        let self = this;

        self.data.pagelets = pagelets ? pagelets : self.pagelets;

        return self.data;
    }

    out() {
        if (this.isMock && this.previewFile) {
            fs.writeFileSync(this.previewFile, this.chunks.join('\n'));

            let _d = this.data;
            delete _d.pagelets;

            var _a = [];

            for (let i in this.allPagelets) {
                let _p = this.allPagelets[i];
                delete _p.owner;
                _a.push(_p);
            }

            let d = {
                layout: this.layout,
                layoutHtml: this.layoutHtml,
                data: _d,
                // pagelets: this.pagelets,
                allPagelets: _a,
                chunks: this.chunks
            };

            fs.writeFileSync(this.previewFile + '.json', JSON.stringify(d, null, 4));
        }
    }

    preview(file) {
        this.previewFile = file;
    }

    processError(err) {
        return new Promise(function (resolve, reject) {
            console.log(err);
            resolve(true);
        });
    }

    // lifecycle;
    beforeRenderPagelets() {
        return Promise.resolve(true)
    }

    afterRenderPagelets() {
        return Promise.resolve(true)
    }

    beforeRenderLayout() {
        return Promise.resolve(true)
    }

    afterRenderLayout() {
        return Promise.resolve(true)
    }
};
